CREATE DATABASE at_exam_portal

USE at_exam_portal

CREATE TABLE std_user (
	id INT NOT NULL auto_increment,
    name VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
);


SELECT * FROM std_user;

CREATE TABLE std_results (
	id INT NOT NULL auto_increment,
    user_id VARCHAR(25) NOT NULL,
    exam_category VARCHAR(50) NOT NULL,
    score INT NOT NULL,
    total_questions VARCHAR(50) NOT NULL,
    correct_answers VARCHAR(50) NOT NULL,
    incorrect_answers VARCHAR(50) NOT NULL,
    time_taken VARCHAR(20) NOT NULL,
    exam_date VARCHAR(20) NOT NULL
);

SELECT * FROM std_results;