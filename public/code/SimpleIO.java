import java.util.Scanner; // Import the Scanner class

public class SimpleIO {

    public static void main(String[] args) {
        // Create a Scanner object to read input from the console
        Scanner scanner = new Scanner(System.in);

        // --- Output --- 
        // Print a message to the console to ask for user input
        System.out.println("Enter your name:");

        // --- Input ---
        // Read the next line of text that the user types
        String userName = scanner.nextLine();

        // --- Output ---
        // Print a personalized greeting to the console
        System.out.println("Hello, " + userName + "! Welcome to simple Java I/O.");

        // --- Asking for a number ---
        System.out.println("Now, enter your favorite number:");

        // --- Input ---
        // Read the next integer that the user types
        int userNumber = scanner.nextInt();

        // --- Output ---
        // Print the number back to the user
        System.out.println("You entered the number: " + userNumber);

        // It's good practice to close the scanner when you're done with it
        scanner.close();
    }
}
