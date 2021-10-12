const
    config     = exports,
    {joinPath} = require('./setup-util.js');

config.ec_ids_folder = joinPath(__dirname, '../..');

config.omejdn_daps                  = {};
config.omejdn_daps.repo_url         = 'https://github.com/nicosResearchAndDevelopment/omejdn-daps.git';
config.omejdn_daps.repo_folder      = joinPath(config.ec_ids_folder, 'omejdn-daps');
config.omejdn_daps.config_folder    = joinPath(config.omejdn_daps.repo_folder, 'config');
config.omejdn_daps.clients_file     = joinPath(config.omejdn_daps.config_folder, 'clients.yml');
config.omejdn_daps.users_file       = joinPath(config.omejdn_daps.config_folder, 'users.yml');
config.omejdn_daps.keys_folder      = joinPath(config.omejdn_daps.repo_folder, 'keys');
config.omejdn_daps.signing_key_file = joinPath(config.omejdn_daps.keys_folder, 'signing_key.pem');
config.omejdn_daps.image_name       = 'omejdn-daps';
config.omejdn_daps.container_name   = 'omejdn-daps';
config.omejdn_daps.exposed_port     = 4567;

config.metadata_broker                       = {};
config.metadata_broker.repo_url              = 'https://github.com/nicosResearchAndDevelopment/metadata-broker-open-core.git';
config.metadata_broker.repo_folder           = joinPath(config.ec_ids_folder, 'metadata-broker');
config.metadata_broker.cert_folder           = joinPath(config.metadata_broker.repo_folder, 'certs');
config.metadata_broker.docker_compose_folder = joinPath(config.metadata_broker.repo_folder, 'docker/composefiles/broker-localhost');
config.metadata_broker.docker_compose_file   = joinPath(config.metadata_broker.docker_compose_folder, 'docker-compose.yml');
config.metadata_broker.image_name            = 'metadata-broker';
config.metadata_broker.container_name        = 'metadata-broker';
config.metadata_broker.exposed_http_port     = 8480;
config.metadata_broker.exposed_https_port    = 8443;

config.dataspace_connector                = {};
config.dataspace_connector.repo_url       = 'https://github.com/International-Data-Spaces-Association/DataspaceConnector.git';
config.dataspace_connector.repo_folder    = joinPath(config.ec_ids_folder, 'dataspace-connector');
// config.dataspace_connector.image_name     = 'dataspace-connector';
config.dataspace_connector.image_name     = 'ghcr.io/international-data-spaces-association/dataspace-connector:latest';
config.dataspace_connector.container_name = 'dataspace-connector';
config.dataspace_connector.exposed_port   = 8180;

module.exports = config;
