# treetracker-mobile-api
The API for the mobile app segement

# Dockerized deployment

Run `./dockerw build` to build the image of the mobile API locally using defaults, and to run the image use `./dockerw run`.

To see what arguments can be passed, simply run `./dockerw`. In order to use something created in the `build` mode, you must specify the same arguments in the `run` mode or it will attempt to pull the image. There is also an `up` mode that can be used, to build and run in one command with the same arguments.