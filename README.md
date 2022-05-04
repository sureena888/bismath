![BISMATH](https://user-images.githubusercontent.com/29928511/151274075-d36b6597-c7eb-461d-8dd7-0072fc24e631.jpg)

## The Language Bismath

Welcome to the compiler for Bismath! With a goal of making math a lot easier for programmers, Bismath aims to provide its users with a variety of functions to make everything from simple math to more difficult topics such as calculus and linear algebra easier! We are hoping to create a user friendly and fun way for users to experience and understand math, through exciting ways of engagement and the connection between math and crystals.

# Features

- Dynamic
- Variable assignments
- If-Statements
- Loops
- Function declarations
- Comments

## Examples

# Hello World Function

    put "Hello, world!!!";

# Variable Assignment

    set x = 10;
    fix y = -7.145;
    set example = "Welcome to Bismath!";

# Basic Expressions

    x = x + 3;
    put 5 + (7 - 9) * (4 + 1) + y^8;
    put !((x > y) && (x != 0 || y != 0));
    put true ? x : y;

# Calculate the area of a circle given a radius

    function calcArea(radius) {
        output pi*radius^2;
    }
    put calcArea(10);

# If-statements

    (x > 0) -> {
        put "greater";
    } otherwise (x < 0) -> {
        put "less than";
    } otherwise {
        put "equals zero";
    }

# Loops, vectors, and matrices

    set matrix = [[1,2,3], [4,5,6], [7,8,9]];

    for row in matrix {
        for col in row {
            put ("row: @(row), col: @(col)"); //parenthesis are optional for the expression
        }
    }

# Why Bismath is unique? Easily multiply matrices, find the determinant of a matrix, etc. shown below

# Matrix operations built-in

    set m = [[1,2], [3,4]]; // 2x2 matrix
    set n = [[5], [6]]; // 2x1 matrix
    set 0 = [[7], [8]]; // 2x1 matrix

    set multiplication = m*n; // result is a 2x1 matrix
    set addition = n+0; // result is a 2x1 matrix
