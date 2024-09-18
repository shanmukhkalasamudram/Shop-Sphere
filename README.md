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
Adding Redis, Mysql 

Redis Wrapper
Mysql Functions, 

Sequalize Package

## Swagger automation for generating API documentation can significantly streamline the process of maintaining consistent and accurate API documentation. Here's an in-depth look at how this can be achieved:

Automated Generation of API YAML Files Based on Exposure Status
Exposure Status Definition:
        Public APIs: APIs exposed to external clients.
        Private APIs: APIs used internally within the organization.
Automated Generation:
Identify Exposure Status: APIs can be tagged or annotated with their exposure status in the codebase.
Generate Swagger YAML: A script or tool can parse the codebase, identify APIs and their exposure status, and generate corresponding Swagger YAML files. This ensures that APIs are correctly documented according to whether they are public or private.

Benefits:
    Consistency: Ensures uniform documentation across all APIs.
    Time-Saving: Reduces manual effort in maintaining API documentation.
    Accuracy: Minimizes the risk of human error in documenting APIs.
    Maintaining Uniform API Documentation
Standardization:
    Define a standard format for API documentation.
    Use consistent terminology, structure, and style across all API documentation.
Automation Tools:
    Use tools like Swagger or OpenAPI to enforce documentation standards.
    Integrate these tools with your CI/CD pipeline to automatically generate and update documentation.
Schema Validation:
    Use JSON Schema or Joi for request and response validation.
    Automatically generate documentation from these schemas to ensure that the documented API matches the actual API behavior.
    Auto Generation of Sample Request Body Through Joi Schemas
Joi Schemas:
    Joi is a powerful schema description language and data validator for JavaScript.
    Define your request and response schemas using Joi.
Generate Sample Request Bodies:
Write a script to parse Joi schemas and generate example request bodies.
This script can generate different sample data types based on the Joi schema definitions (e.g., strings, numbers, dates).
Integrating with Swagger:
Use the script to automatically include these sample request bodies in the Swagger documentation.


## What is ASB?
Service Bus is a robust, managed messaging broker designed for enterprise-level communication between applications. It enables reliable and secure asynchronous data exchange by allowing the transmission of raw data in various formats such as JSON, XML, or plain text. Applications connected to Service Bus can process these messages effectively.

There are a few components that make up Service Bus:

Namespace
Queues
Topics

Namespace
A namespace serves as a comprehensive container for all messaging elements. Within a single namespace, it's possible to house multiple queues and topics, effectively functioning as application containers. In scenarios where an application comprises various components, these components can be linked to the topics and queues housed within the namespace.


Queues
Queues act as repositories for messages, serving as the point where messages are dispatched and received. Messages sent to a queue remain stored until they are fetched and processed by the receiving application. The mechanism operates on a First-In, First-Out (FIFO) basis.

Upon receiving a new message in the queue, Service Bus assigns a timestamp to it. Once processed, the message is securely stored in redundant storage.

Messages within the queue are delivered in a pull mode, implying that they are only delivered when specifically requested by an application