/* eslint-disable import/no-extraneous-dependencies */
const joiToSwagger = require('joi-to-swagger');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const YAML = require('js-yaml');
const logger = require('../util/logger/logger.util');

const configuration = {
  serverUrls: [
    {
      url: 'localhost:9200',
      description: 'Gateway',
    },
  ],
  serviceName: 'Project Name',
  description: '',
  gatewayApimFilePath: './api-management/shopshere/open-api.yaml',
  gatewayOpenApimFilePath: './api-management/shopshere-open/open-api.yaml',
  internalApimFilePath: './api-management/shopshere-internal/open-api.yaml',
  endpointPrefix: '/api',
};

const swaggerBaseConfig = {
  openapi: '3.0.1',
  info: {
    title: configuration.serviceName,
    description: configuration.description,
    version: '1.0',
  },
  servers: configuration.serverUrls,
  paths: {},
  components: {
    responses: {
      Success: {
        description: 'OK',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Success',
            },
          },
        },
      },
      BadRequest: {
        description: 'Bad Request',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      Unauthenticated: {
        description: 'Unauthenticated',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
      InternalServerError: {
        description: 'Internal Server Error',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
          },
        },
      },
    },
    schemas: {
      Success: {
        properties: {
          is_success: {
            type: 'boolean',
            default: true,
          },
          data: {
            type: 'object',
          },
        },
      },
      Error: {
        properties: {
          is_success: {
            type: 'boolean',
            default: false,
          },
          message: {
            type: 'string',
          },
        },
      },
    },
  },
};

const gatewayApim = { ...swaggerBaseConfig, paths: {} };
const ingressApim = { ...swaggerBaseConfig, paths: {} };
const internalApim = { ...swaggerBaseConfig, paths: {} };

let oldGatewayApimDoc;
let oldGatewayOpenApimDoc;
let oldInternalApimDoc;
try {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  oldGatewayApimDoc = YAML.load(
    fs.readFileSync(configuration.gatewayApimFilePath, 'utf-8')
  );
  oldGatewayOpenApimDoc = YAML.load(
    fs.readFileSync(configuration.gatewayOpenApimFilePath, 'utf-8')
  );
  oldInternalApimDoc = YAML.load(
    fs.readFileSync(configuration.internalApimFilePath, 'utf-8')
  );
} catch (error) {
  oldGatewayApimDoc = swaggerBaseConfig;
  oldGatewayOpenApimDoc = swaggerBaseConfig;
  oldInternalApimDoc = swaggerBaseConfig;
}
const isDirectory = (folder, source) =>
  fs.lstatSync(path.join(folder, source)).isDirectory();

const generateSwaggerParam = (
  paramName,
  location,
  schema,
  required = true
) => ({
  name: paramName,
  in: location,
  required: required || undefined,
  schema,
});

const generateDocsForModule = (file, module, subModule) => {
  const filePath = `${__dirname}/${file}/${module}${
    subModule ? `/${subModule}` : ''
  }/${subModule || module}.route.js`;
  const fileString = fs.readFileSync(filePath, { encoding: 'utf8' });
  // eslint-disable-next-line no-restricted-syntax
  for (let route of fileString.split('router.').splice(1)) {
    let method = route.split('(')[0];
    // eslint-disable-next-line no-shadow
    let path = route.split("'")[1].split("'")[0];
    let schemaName =
      route.split('ValidationMiddleware(')[1]?.split('.')[1].split(')')[0] ||
      route.split('validationMiddleware(')[1]?.split('.')[1].split(')')[0];
    let schemaData;
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      let schemas = require(`./${file}/${module}/${module}.schema`);
      schemaData = joiToSwagger(schemas[schemaName]).swagger;
    } catch (error) {
      schemaData = {};
    }
    let apiTitle = `${configuration.endpointPrefix}/${file}/${module}${
      subModule ? `/${subModule}` : ''
    }${path}`;
    const apiExposure = schemaData.description || 'internal';
    let swaggerObject = {};
    let params;
    let optionalParams = [];
    if (apiTitle.includes(':')) {
      let base = apiTitle.split('/');
      params = [];
      base = base.map((part) => {
        if (part.includes(':')) {
          params = _.concat(params, part.split(':')[1].split('?')[0]);
          if (part.split(':')[1].includes('?')) {
            optionalParams = _.concat(optionalParams, part);
          }
          return `{${part.split(':')[1].split('?')[0]}}`;
        }
        return part;
      });
      apiTitle = base.join('/');
    }
    let oldResponse;
    let defaultResponse = {
      content: {
        'application/json': {
          schema: {
            description: '',
            properties: {
              is_success: {
                type: 'boolean',
                default: true,
              },
              data: {
                type: 'object',
              },
            },
          },
        },
      },
    };
    switch (apiExposure) {
      case 'gateway':
        oldResponse =
          oldGatewayApimDoc.paths?.[apiTitle]?.[method]?.responses['200'] ||
          defaultResponse;
        break;
      case 'gateway-open':
        oldResponse =
          oldGatewayOpenApimDoc.paths?.[apiTitle]?.[method]?.responses['200'] ||
          defaultResponse;
        break;
      case 'internal':
        oldResponse =
          oldInternalApimDoc.paths?.[apiTitle]?.[method]?.responses['200'] ||
          defaultResponse;
        break;
      default:
        break;
    }
    oldResponse.description = '';
    swaggerObject = {
      ...swaggerObject,
      [apiTitle]: {
        [method]: {
          tags: [module, ...(schemaData.title ? [schemaData.title] : [])],
          summary: `${apiTitle} ${method.toUpperCase()}`,
          operationId: `${method}-${apiTitle
            .replace(/\/+$/, '')
            .split('/')
            .splice(1)
            .join('-')
            .replaceAll('{', '')
            .replaceAll('}', '')}`,
          parameters: [
            {
              ...generateSwaggerParam('X-Authorization', 'header', {
                type: 'string',
              }),
            },
            ..._.map(params, (name) => ({
              ...generateSwaggerParam(
                name,
                'path',
                schemaData.properties?.params?.properties[name] || {
                  type: 'string',
                }
              ),
            })),
            ..._.map(
              Object.keys(schemaData.properties?.query?.properties || {}),
              (name) => ({
                ...generateSwaggerParam(
                  name,
                  'query',
                  schemaData.properties?.query?.properties[name],
                  schemaData.properties?.query?.required?.includes(name) ||
                    false
                ),
              })
            ),
          ],
          requestBody: schemaData.properties?.body && {
            content: {
              'application/json': {
                schema: schemaData.properties?.body,
              },
            },
          },
          responses: {
            200: oldResponse,
            400: {
              $ref: '#/components/responses/BadRequest',
            },
            401: {
              $ref: '#/components/responses/Unauthenticated',
            },
            500: {
              $ref: '#/components/responses/InternalServerError',
            },
          },
        },
      },
    };
    if (apiExposure === 'gateway')
      swaggerObject = Object.assign(
        {},
        swaggerObject,
        ..._.map(optionalParams, (param) => ({
          [apiTitle.replace(`{${param.split(':')[1].split('?')[0]}}`, '')]: {
            [method]: {
              tags: [module, ...(schemaData.title ? [schemaData.title] : [])],
              summary: `${apiTitle
                .replace(/\/+$/, '')
                .replace(`/{${param.split(':')[1].split('?')[0]}}`, '')
                .split('/')
                .splice(1)
                .join('/')
                .replaceAll('{', '')
                .replaceAll('}', '')} ${method.toUpperCase()}`,
              operationId: `${method}-${apiTitle
                .replace(/\/+$/, '')
                .replace(`/{${param.split(':')[1].split('?')[0]}}`, '')
                .split('/')
                .splice(1)
                .join('-')
                .replaceAll('{', '')
                .replaceAll('}', '')}`,
              parameters: [
                {
                  ...generateSwaggerParam('X-Authorization', 'header', {
                    type: 'string',
                  }),
                },
                ..._(
                  _.filter(
                    params,
                    (name) => name !== param.split(':')[1].split('?')[0]
                  )
                ).map(params, (name) => ({
                  ...generateSwaggerParam(
                    name,
                    'path',
                    schemaData.properties?.params?.properties[name] || {
                      type: 'string',
                    }
                  ),
                })),
                ..._.map(
                  Object.keys(schemaData.properties?.query?.properties || {}),
                  (name) => ({
                    ...generateSwaggerParam(
                      name,
                      'query',
                      schemaData.properties?.query?.properties[name],
                      schemaData.properties?.query?.required?.includes(name) ||
                        false
                    ),
                  })
                ),
              ],
              requestBody: schemaData.properties?.body && {
                content: {
                  'application/json': {
                    schema: schemaData.properties?.body,
                  },
                },
              },
              responses: {
                200: oldResponse,
                400: {
                  $ref: '#/components/responses/BadRequest',
                },
                401: {
                  $ref: '#/components/responses/Unauthenticated',
                },
                500: {
                  $ref: '#/components/responses/InternalServerError',
                },
              },
            },
          },
        }))
      );
    switch (apiExposure) {
      case 'internal':
        internalApim.paths = _.merge(internalApim.paths, swaggerObject);
        break;
      case 'gateway':
        gatewayApim.paths = _.merge(gatewayApim.paths, swaggerObject);
        break;
      case 'gateway-open':
        ingressApim.paths = _.merge(ingressApim.paths, swaggerObject);
        break;
      default:
        break;
    }
  }
};

const setupDocs = () => {
  fs.readdirSync(__dirname)
    .filter((file) => isDirectory(__dirname, file))
    .forEach((file) => {
      const currentFile = path.join(__dirname, file);
      fs.readdirSync(currentFile)
        .filter((module) => isDirectory(currentFile, module))
        .forEach((module) => {
          const hasSubModules = fs
            .readdirSync(`${currentFile}/${module}`)
            .some((subPath) => subPath.split('.').length <= 1);
          if (!hasSubModules) {
            generateDocsForModule(file, module);
          } else {
            fs.readdirSync(`${currentFile}/${module}`).forEach((subModule) => {
              if (isDirectory(`${currentFile}/${module}`, subModule)) {
                generateDocsForModule(file, module, subModule);
              }
            });
          }
          const gatewayApimFile = YAML.dump(gatewayApim);
          fs.writeFileSync(
            path.resolve(configuration.gatewayApimFilePath),
            gatewayApimFile
          );
          const gatewayOpenApimFile = YAML.dump(ingressApim);
          fs.writeFileSync(
            path.resolve(configuration.gatewayOpenApimFilePath),
            gatewayOpenApimFile
          );
          const internalApimFile = YAML.dump(internalApim);
          fs.writeFileSync(
            path.resolve(configuration.internalApimFilePath),
            internalApimFile
          );
          logger.info(`Docs created for APIs: ${file}/${module}`);
        });
    });
};

setupDocs();

module.exports = setupDocs;
