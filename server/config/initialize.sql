CREATE DATABASE IF NOT EXISTS iotInfodb;
USE iotInfodb;

CREATE TABLE users(
    username varchar(30) NOT NULL,
    password varchar(30) NOT NULL,
    PRIMARY(username)
);

CREATE TABLE viewControl(
    username varchar(30) NOT NULL,
    device varchar(30) NOT NULL
);

CREATE TABLE devices(
    device varchar(30) NOT NULL,
    PRIMARY(device)
);