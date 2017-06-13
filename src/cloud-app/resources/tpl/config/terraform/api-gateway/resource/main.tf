variable "rest_api_id" {
  description = "The ID of the associated REST API"
}

variable "resource_id" {
  description = "The API resource ID"
}

variable "methods" {
  description = "The HTTP methods to forward"
  default = ["GET"]
}

variable "path" {
  description = "The API resource path"
}

variable "lambda_arn" {
  description = "The ARN of the lambda to invoke"
}

variable "region" {
  description = "The AWS region, e.g., eu-west-1"
}

variable "account_id" {
  description = "The AWS account ID"
  default = ""
}

data "template_file" "account_id" {
  template_body = "$${account}"
  vars {
    // If `var.account_id` was not supplied, infer it from the lambda function's ARN.
    account = "${var.account_id == "" ? index(split(":", var.lambda_arn), 4) : var.account_id}"
  }
}

# Example: request for GET /hello
resource "aws_api_gateway_method" "request_method" {
  count = "${length(var.methods)}"
  rest_api_id = "${var.rest_api_id}"
  resource_id = "${var.resource_id}"
  http_method = "${index(var.methods, count.index)}"
  authorization = "NONE"
}

# Example: GET /hello => POST lambda
resource "aws_api_gateway_integration" "request_method_integration" {
  count = "${length(var.methods)}"

  rest_api_id = "${var.rest_api_id}"
  resource_id = "${var.resource_id}"
  http_method = "${aws_api_gateway_method.request_method.*.http_method}"
  type = "AWS"
  uri = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${var.lambda_arn}/invocations"

  # AWS lambdas can only be invoked with the POST method
  integration_http_method = "POST"
}

# lambda => GET response
resource "aws_api_gateway_method_response" "response_method" {
  count = "${length(var.methods)}"

  rest_api_id = "${var.rest_api_id}"
  resource_id = "${var.resource_id}"
  http_method = "${aws_api_gateway_integration.request_method_integration.*.http_method}"
  status_code = "200"

  response_models = {
    "application/json" = "Empty"
  }
}

# Response for: GET /hello
resource "aws_api_gateway_integration_response" "response_method_integration" {
  count = "${length(var.methods)}"

  rest_api_id = "${var.rest_api_id}"
  resource_id = "${var.resource_id}"
  http_method = "${aws_api_gateway_method_response.response_method.http_method}"
  status_code = "${aws_api_gateway_method_response.response_method.status_code}"

  response_templates = {
    "application/json" = ""
  }
}

resource "aws_lambda_permission" "allow_api_gateway" {
  count = "${length(var.methods)}"

  function_name = "${var.lambda}"
  statement_id = "AllowExecutionFromApiGateway"
  action = "lambda:InvokeFunction"
  principal = "apigateway.amazonaws.com"
  source_arn = "arn:aws:execute-api:${var.region}:${data.template_file.account_id.rendered}:${var.rest_api_id}/*/${index(var.method, count.index)}${var.path}"
}

output "http_method" {
  value = "${aws_api_gateway_integration_response.response_method_integration.*.http_method}"
}
