import gulp from 'gulp';
import {log, colors} from 'gulp-util';
import map from 'through2-map';
import {prompt} from 'inquirer';
import conflict from 'gulp-conflict';
import _ from 'lodash';

import {fromContents, tpl} from './util';
import {eslintrc, gitignore} from './dotfiles';

const responses = {};

type HttpMethod =
  | 'GET'
  | 'PUT'
  | 'POST'
  | 'PATCH'
  | 'DELETE'
  | 'OPTIONS'
  | 'HEAD'
  ;

type ApiGatewayOpts = {
  resourceName: string,
  path: string,
  methods: Array<HttpMethod>,
};

/**
 * Generate or update `package.json`.
 */
export function apiGatewayJson(origJson, moduleOpts: ApiGatewayOpts) {
  const json = origJson || {};
  if (!origJson) {
    Object.assign(json, {
      'aws_api_gateway_rest_api': {
        api: {
          name: 'api.${data.template_file.site_fqdn.rendered}',
          description: 'Rest API',
        },
      },
      'aws_api_gateway_deployment': {
        deployment: {
          rest_api_id: '${aws_api_gateway_rest_api.api.id}',
          stage_name: 'api',
        },
      },
      'aws_api_gateway_stage': {
        api: {
          deployment_id: '${aws_api_gateway_deployment.deployment.id}',
          rest_api_id: '${aws_api_gateway_rest_api.api.id}',
          stage_name: 'api_${data.template_file.site_symbolic_name.rendered}',
        },
      },
      'module': [],
    });
  }

  const pathSegments = moduleOpts.path.split('/')
    .filter((pathSeg) => pathSeg.length > 0);

  const tailResource = pathSegments.reduce((parentResource, nextSeg, index) => {
    const resourceName = ['http_resource', ...pathSegments.slice(0, index)]
      .join('_');
    const resourceKey = _.findKey(
      json.aws_api_gateway_resource, {
        path_part: nextSeg, parent_id: parentResource,
      }
    );
    const resource = resourceKey
      ? json.aws_api_gateway_resource[resourceKey]
      : {
        rest_api_id: '${aws_api_gateway_rest_api.api.id}',
        path_part: nextSeg,
        parent_id: parentResource,
      };
    if (!resourceKey) {
      json.aws_api_gateway_resource[resourceName] = resource;
    }
  }, '${aws_api_gateway_rest_api.api.root_resource_id}');

  const apigResourceModule = {
    source: './api-gateway/resource',
    rest_api_id: '${aws_api_gateway_rest_api.api.id}',
    resource_id: tailResource,
    methods: moduleOpts.methods,
    path: pathSegments.join('/'),
    region: 'us-east-1',
  };

  json.module.push(apigResourceModule);

  return fromContents('api-gateway.tf.json', JSON.stringify(json, null, 2));
}

/**
 * Create task to prompt the user for information about their package.
 */
export function promptApiGateway(args, env) {
  return function () {
    return prompt([{
      type: 'input',
      name: 'lambdaName',
      message: 'Lambda name?',
    }, {
      type: 'input',
      name: 'path',
      message: 'Resource path?',
    }, {
      type: 'checkbox',
      name: 'methods',
      message: 'Which HTTP methods?',
      default: ['GET'],
      choices: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    }, {
      type: 'input',
      name: 'authorName',
      message: 'Your name?',
    }, {
      type: 'input',
      name: 'authorEmail',
      message: 'Your email (this will be public)?',
    }]);
  };
}

/**
 * Create tasks for package config.
 */
export default function configurePackage(args, env, create, src) {
  let pkgJsonContents;

  gulp.task('api-gateway:method:prompt',
    promptApiGateway(args, env)
  );

  gulp.task('api-gateway:method', ['api-gateway:method:prompt'], () =>
    create('.', packageJson(pkgJsonContents))
  );


  gulp.task('generate:eslintrc', () => create('.', eslintrc()));
  gulp.task('generate:gitignore', () => create('.', gitignore()));
  gulp.task('generate:root-files', [
    'package-json', 'generate:eslintrc', 'generate:gitignore',
  ], () =>
    create('.', tpl('general/**'))
  );
}
