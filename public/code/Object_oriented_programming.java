// OOP in Java: A simple example with Class, Object, Inheritance, Polymorphism, Encapsulation, Abstraction

// 1. CLASS and ENCAPSULATION
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

// 2. INHERITANCE: Dog is a subclass of Animal
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

    // 3. POLYMORPHISM: method overriding
    @Override
    public void speak() {
        System.out.println(getName() + " barks.");
    }
}

// 4. ABSTRACTION through interface
interface Trainable {
    void doTrick(); // method without body (abstract)
}

// Dog implements an interface
class TrainedDog extends Dog implements Trainable {
    public TrainedDog(String name, int age, String breed) {
        super(name, age, breed);
    }

    // implementing abstract method
    public void doTrick() {
        System.out.println(getName() + " rolls over!");
    }
}

// Main class to run the program
public class Main {
    public static void main(String[] args) {
        // OBJECT creation
        Animal generic = new Animal("Unknown", 3);
        Dog dog = new Dog("Buddy", 5, "Labrador");
        TrainedDog trained = new TrainedDog("Max", 4, "German Shepherd");

        // Calling methods
        generic.speak();           // Animal method
        dog.speak();               // Overridden Dog method
        trained.speak();           // Inherited Dog method
        trained.doTrick();         // Interface method

        // Accessing fields through getters
        System.out.println("Dog's breed: " + dog.getBreed());
    }
}