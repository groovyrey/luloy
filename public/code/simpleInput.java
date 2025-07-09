
import java.util.Scanner;

public class Main {
	public static void main(String[] args) {
		
		Scanner pass = new Scanner(System.in);
		System.out.print("Enter password: ");
		String password = pass.nextLine();
		
		if (password.compareTo("@rey8651")==0){
		    System.out.println("Password correct!");
		} else {
		    System.out.println("Password incorrect");
		}
	}
}