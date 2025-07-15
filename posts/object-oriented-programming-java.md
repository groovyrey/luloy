---
title: Object-Oriented Programming in Java
date: 2025-07-15
author: Roksy9RE20Wl4TOVggJYprrEgUm2
description: "An introduction to the core concepts of Object-Oriented Programming (OOP) in Java, including classes, objects, and the four main pillars."
---

# Object-Oriented Programming (OOP) in Java




This lesson introduces the fundamental concepts of Object-Oriented Programming (OOP) using Java. OOP is a programming paradigm based on the concept of "objects", which can contain data and code: data in the form of fields (often known as attributes or properties), and code in the form of procedures (often known as methods).

We will explore the four main pillars of OOP: Encapsulation, Inheritance, Polymorphism, and Abstraction, along with Class and Object creation.

## 1. Class and Encapsulation

A **Class** is a blueprint or a template from which objects are created. It defines the structure and behavior that all objects of that class will have. **Encapsulation** is the bundling of data (attributes) and methods (functions) that operate on the data into a single unit, or class. It also restricts direct access to some of an object's components, which is a means of preventing accidental interference and misuse of the data.

Consider the `Animal` class:

```java
class Animal {
    // private fields (data hiding = encapsulation)
    private String name;
    private int age;

    // constructor
    public Animal(String name, int age) {
        this.name = name;
        this.age = age;
    }

    // public methods (getters/setters) to access private fields
    public String getName() {
        return name;
    }

    public int getAge() {
        return age;
    }

    // a general method
    public void speak() {
        System.out.println("The animal makes a sound.");
    }
}
```

### Explanation of Methods and Concepts:

*   **`private String name;` and `private int age;`**: These are instance variables (fields) of the `Animal` class. The `private` keyword is crucial for encapsulation. It means these variables can only be accessed directly from within the `Animal` class itself. This hides the internal state of the object from the outside world.

*   **`public Animal(String name, int age)` (Constructor)**: This is a special method called a constructor. It has the same name as the class and no return type. Its purpose is to initialize the object's state when a new `Animal` object is created. `this.name = name;` assigns the value passed as an argument to the `name` field of the current object.

*   **`public String getName()` (Getter Method)**: This is a public method that provides controlled access to the private `name` field. It allows other parts of the program to *read* the animal's name without directly accessing the private variable, thus maintaining encapsulation.

*   **`public int getAge()` (Getter Method)**: Similar to `getName()`, this method provides controlled read access to the private `age` field.

*   **`public void speak()`**: This is a public method that defines a behavior for all `Animal` objects. It prints a generic sound message to the console. This method can be called on any `Animal` object.

## 2. Inheritance

**Inheritance** is a mechanism in which one class acquires the properties and behaviors of another class. The class that inherits is called the subclass (or child class), and the class from which it inherits is called the superclass (or parent class). Inheritance promotes code reusability and establishes an "is-a" relationship (e.g., a Dog *is an* Animal).

Consider the `Dog` class inheriting from `Animal`:

```java
class Dog extends Animal {
    private String breed;

    // constructor: uses super() to call Animal constructor
    public Dog(String name, int age, String breed) {
        super(name, age); // calls Animal constructor
        this.breed = breed;
    }

    // getter for breed
    public String getBreed() {
        return breed;
    }
}
```

### Explanation of Methods and Concepts:

*   **`class Dog extends Animal`**: The `extends` keyword signifies that `Dog` is a subclass of `Animal`. This means `Dog` automatically inherits all public and protected fields and methods from `Animal`.

*   **`public Dog(String name, int age, String breed)` (Constructor)**: The constructor for the `Dog` class. It takes `name`, `age`, and `breed` as arguments.

*   **`super(name, age);`**: This is a special call that must be the first statement in a subclass constructor. It invokes the constructor of the superclass (`Animal` in this case), passing the `name` and `age` values to initialize the inherited parts of the `Dog` object.

*   **`private String breed;` and `public String getBreed()`**: `Dog` introduces its own unique field (`breed`) and a corresponding getter method, demonstrating that subclasses can add their own specific attributes and behaviors.

## 3. Polymorphism

**Polymorphism** means "many forms." In Java, it allows objects of different classes to be treated as objects of a common type. The most common form is method overriding, where a subclass provides a specific implementation for a method that is already defined in its superclass.

Observe the `speak()` method in `Dog`:

```java
class Dog extends Animal {
    // ... (previous code)

    // POLYMORPHISM: method overriding
    @Override
    public void speak() {
        System.out.println(getName() + " barks.");
    }
}
```

### Explanation of Methods and Concepts:

*   **`@Override`**: This annotation is optional but highly recommended. It tells the compiler that this method is intended to override a method in the superclass. If there's no such method in the superclass, the compiler will throw an error, helping to catch mistakes.

*   **`public void speak()` (Overridden Method)**: The `Dog` class provides its own implementation of the `speak()` method, which was inherited from `Animal`. When `speak()` is called on a `Dog` object, this specific implementation (`getName() + " barks."`) will be executed instead of the `Animal`'s generic `speak()` method.

*   **`trained.speak();`**: Calls the `speak()` method on the `trained` object. Since `TrainedDog` inherits from `Dog` and doesn't override `speak()` itself, it uses the `Dog`'s overridden `speak()` method.

*   **`trained.doTrick();`**: Calls the `doTrick()` method on the `trained` object. This method is implemented by `TrainedDog` as required by the `Trainable` interface.

*   **`System.out.println("Dog's breed: " + dog.getBreed());`**: Demonstrates accessing an object's property (`breed`) through its public getter method (`getBreed()`), adhering to encapsulation principles.

This example illustrates how these core OOP principles work together to create modular, reusable, and maintainable code in Java.

## References

1.  Oracle. (n.d.). *The Java Tutorials - Learning the Java Language*. Retrieved from https://docs.oracle.com/javase/tutorial/java/
2.  Gamma, E., Helm, R., Johnson, R., & Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley.
