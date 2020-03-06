## MongoDB client


## Docker

```docker pull mongoclient/mongoclient```

To install latest stable release:

```docker pull mongoclient/mongoclient:2.2.0```

Then you can run it as a daemon:

```docker run -d -p 3000:3000 mongoclient/mongoclient```

To set an external mongodb which is required for meteor to work, you can set ```MONGO_URL``` environment variable. Otherwise nosqlclient will install mongodb to container and use it.

To persist your connections and settings simply bind ```/data/db``` directory to your local machine as below.

```docker run -d -p 3000:3000 -v <your_path>:/data/db mongoclient/mongoclient```

