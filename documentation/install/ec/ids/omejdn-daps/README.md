# testbed install `ids` omejdn-daps

## Links

- [GitHub / IDSA / Omejdn DAPS](https://github.com/International-Data-Spaces-Association/omejdn-daps)
- [GitHub / NRD / Omejdn DAPS](https://github.com/nicosResearchAndDevelopment/omejdn-daps)

## Instructions

1. Clone Omejdn-DAPS repository to your favorite location.
2. Open the cloned repository in your favorite command line terminal.
3. Make sure the docker daemon is running.
4. Build a docker image with the following command:
   ```powershell
   docker build                             `
       --tag omejdn-daps                    `
       .
   ```
   > The image can be removed with: `docker rmi omejdn-daps`
5. Create a container from the image with the following command:
   ```powershell
   docker create                            `
       --name omejdn-daps                   `
       --publish 4567:4567                  `
       --volume $PWD/config:/opt/config     `
       --volume $PWD/keys:/opt/keys         `
       omejdn-daps
   ```
   You might need to give docker access to the two filesystem folder (config and keys).
   > The container can be removed with: `docker rm omejdn-daps`
6. Start the container with the following command:
   ```powershell
   docker start                             `
       --attach                             `
       omejdn-daps
   ```
   > The container can be stopped with: `docker stop omejdn-daps`

---
