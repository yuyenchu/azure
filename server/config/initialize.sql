CREATE DATABASE IF NOT EXISTS iotInfodb;
USE iotInfodb;

Drop Table IF Exists users;
CREATE TABLE users(
    username varchar(30) NOT NULL,
    password varchar(30) NOT NULL,
    PRIMARY KEY(username)
);

Drop Table IF Exists viewControl;
CREATE TABLE viewControl(
    username varchar(30) NOT NULL,
    device varchar(200) NOT NULL,
    PRIMARY KEY(username, username)
);

Drop Table IF Exists devices;
CREATE TABLE devices(
    id varchar(200) NOT NULL,
    PRIMARY KEY(id)
);