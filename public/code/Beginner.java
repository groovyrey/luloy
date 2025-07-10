import java.util.Scanner;

public class BeginnerExample {
    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);

        // Ask for user's name
        System.out.print("Enter your name: ");
        String name = input.nextLine();

        // Ask for two numbers
        System.out.print("Enter first number: ");
        int num1 = input.nextInt();

        System.out.print("Enter second number: ");
        int num2 = input.nextInt();

        // Calculate sum
        int sum = num1 + num2;

        // Output
        System.out.println("\nHello, " + name + "!");
        System.out.println("The sum of " + num1 + " and " + num2 + " is: " + sum);

        // Basic condition
        if (sum > 100) {
            System.out.println("That's a big number!");
        } else {
            System.out.println("That's a small number!");
        }

        input.close();
    }
}