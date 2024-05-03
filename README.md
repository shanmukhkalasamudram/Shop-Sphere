### Introduction 

This project includes only Backend Development involving various technologies and tools. Assumption is this is microservice level architecture. 
This project involves various functionalities which includes Authentication, Onboarding, Purchase, Check out etc..
Each will be sub divided into sub modules. 

## Modules 


## Achieving CQRS with Monstache
Here in this project I have Mongo Database and to implement efficient search functionality we introduced Elastic Search. 
Elastic Search is very effective for any kind of search operations. 
To sync databases, I have used Monstache to keep mongo and elastic search in synchronized. 
To implement with ease, running the monstache service over the docker. Refer to Monstache Folder for config and docker-compose file
Pre-requisite - Docker Hub, Docker running on PC, Cluster 
docker start project
docker-compose up -d


## Kafka Integration to sync 
In this project, I have also integrated kafka to sync documents between Mongo and Elastic Search without monstache. Also this Kafka will be used more intensively in further areas. 

## Databases or Platforms 
Mongo Db 
