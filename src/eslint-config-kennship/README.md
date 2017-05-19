# eslint-config-kennship

ESLint configurations.

## Usage

```bash
npm install --save-dev eslint-config-kennship
```

There are three subconfigs that are appropriate for different areas of a project.

### Main config

```yml
# .eslintrc
extends: eslint-config-kennship
```

Most stringent configuration.

### "Config" config

```yml
# .eslintrc
extends: eslint-config-kennship/config
```

A bit more relaxed; appropriate for Gulpfiles or other "plumbing".

### Testing config

```yml
# .eslintrc
extends: eslint-config-kennship/testing
```

Removes JSDoc requirements.
