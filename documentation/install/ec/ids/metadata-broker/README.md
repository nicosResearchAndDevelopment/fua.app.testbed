# testbed install `ids` metadata-broker

## Links

- [GitHub / IDSA / Metadata Broker](https://github.com/International-Data-Spaces-Association/metadata-broker-open-core)

# Automated Instructions

1. Make sure the docker daemon is up and running.
2. Use `npm run install-metadata-broker` to load the metadata-broker-open-core repository, build an image and create the
   container. You might be confronted to give access to the _certs_ folder in the newly cloned repository. A new
   certificate will have been generated to enable TLS communication for the broker.
3. Use `npm run launch-metadata-broker` to start the container.

## Manual instructions

1. Clone Metadata-Broker repository to your favorite location.
2. Open the cloned repository in your favorite command line terminal.
3. Create a directory for TLS certificates and generate a _server.crt_ and _server.key_ file. You can do this with
   openssl. Use `openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes` to generate pem
   encoded certificates and `openssl x509 -in cert.pem -out server.crt` and `openssl rsa -in key.pem -out server.key`
   to convert those to the right format.
4. Navigate to the folder _docker/composefiles/broker-localhost_ via `cd docker/composefiles/broker-localhost`.
5. Edit the _docker-compose.yml_ file and change the volume binding of the _cert_ folder to your newly created cert
   folder. If the ports _80_ and _443_ are not available on your system, change those as well (Edit the first number of
   the pair).
6. Make sure the docker daemon is running.
7. Create the necessary container with docker-compose using the following command:
   ```powershell
   docker-compose pull
   ```
   The current working directory must be the folder with the _docker-compose.yml_ in it. You might need to give docker
   access to the filesystem folder (cert).
8. Start the container with the following command:
   ```powershell
   docker-compose up –d
   ```

---
