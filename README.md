# QuienEsQuien.Wiki

QuienEsQuien.Wiki es una aplicación para acumular datos sobre personas organizaciones y contratos en América y sus alrededores.

### obtén el código

    git clone https://github.com/ProjectPODER/QuienEsQuien.git
    cd QuienEsQuien/src

### configura el base de datos

    export MONGO_URL=mongodb://$HOST/$COLLECTION

### ejecuta
    meteor run

### ejecuta como applicación de escritorio

    npm install -g electrify
    electrify

### ejecuta imagen docker

    docker run --rm --net=host -p 80 -e PORT=80 \
      -e ROOT_URL=http://localhost \
      -e MONGO_URL=mongodb://$Host/$COLLECTION \
      poder/quienesquienwiki:$version

donde `$version` es el [versión de quienesquien.wiki](https://hub.docker.com/r/poder/qqw/tags/)
