package activities;
import java.util.Scanner;

//basics ng java sa oop
//OBJECT ORIENTED PROGRAMMING


public class act1{
	public static void main(String []args) {
		Scanner scan= new Scanner(System.in);
		
		
		
		                 //string  //int sa another class
		//act2 first=new act2("nike", 150, true);
		//act2 second=new act2("addidas", 100, true);
		//act2 third=new act2("dicky", 200,true);
		
		//oop na may input user
		//System.out.print("Enter firstname:");
		//String dominic=scan.nextLine();
		
		//System.out.print("Enter Lastname:");
		//String lastname=scan.nextLine();
		
		//System.out.print("Enter age:");
		//int edad=scan.nextInt();
		
		
		//act3 haha=new act3(dominic,lastname,edad);
		
		
		
		
		//object methods that talk about the student 
		
	
		act3 info= new act3("Dominic","Dugan","Information technology","2D","first year",85,90,85/90);
		
		
		info.introduce();
		info.evaluategrade();		
		
		
		
		
		
		
		
		
		
		
		
		//for loop and if else combine
		//int life =3;
		
		//for(int i=1; i<=3; i++) {		
			//System.out.print("ilan ang buto ng mangga? ");
			//int num= scan.nextInt();	
			//if(num==1) {
				//System.out.print("you won");
				//break;
			//}else {
				
				//life--;
				//System.out.println("mali ka! nalalabing buhay: "+life);
				
			//}
			
			
			
			//if(life==0)System.out.println("naubos na buhay mo talo ka: "+ life);
		
		
		
	}
}

//class nyan


package activities;

public class act2 {
	
	//NOTE (this syntax is use to call global variable)
	String shoes;//global variable
	int money;
	boolean rain;
	
	act2(String parameter1, int parameter2, boolean parameter3){	
		this.shoes=parameter1;
		this.money=parameter2;	
		this.rain=parameter3;
		
		
		System.out.println(parameter1);
	}

	
 
}


//activity 2
package train;
import java.util.Scanner;
public class First {

	public static void main(String[] args) {
		Scanner scan=new Scanner (System.in);
		
		// encapsulation
		//keep the attributes private
		//protects ur code from the 3rd party
		
		//scanner
		
		//System.out.print("Enter your Firstname: ");
		//String dominic=scan.nextLine();
		

		//System.out.print("Enter your Lastname: ");
		//String dugan=scan.nextLine();
		
		
		//System.out.print("Enter your Course: ");
		//String it=scan.nextLine();
		
		//System.out.print("Enter your Section: ");
		//String d1=scan.nextLine();
		
		
		//System.out.print("Enter your Hobby: ");
		//String chess=scan.nextLine();
		
		//System.out.print("Enter your Gmail: ");
		//String dugdom=scan.nextLine();
		
		
		//System.out.print("Enter your age: ");
		//int six=Integer.parseInt(scan.nextLine());
		
		//System.out.print("Enter your Cellphone: ");
		//long nine=Long.parseLong(scan.nextLine());
		
		
		
		//input scanner
		//Encapsulate x= new Encapsulate(dominic,dugan,it,d1,chess,dugdom,six,nine);
		
		//space
		//System.out.println(" ");
		//System.out.println(" ");
		
		//System.out.println("Your Student Update Info:");

		//System.out.println(" ");
		//System.out.println(" ");
		//x-variable ng encapsulate na class
		//encapsulate.getfirstname
		//System.out.println("Your firstname: "+x.getFirstName());
		//System.out.println("Your lastname: "+x.getLastName());
		//System.out.println("Your course: "+x.getCourse());
		//System.out.println("Your section: "+x.getSection());
		//System.out.println("Your hobby: "+x.getHobby());
		//System.out.println("Your Gmail: "+x.getGmail());
		//System.out.println("Your Age: "+x.getAge());
		//System.out.println("Your Cellphone: "+x.getCellphone());
		
		
		
		
		//prints the method without input users
		second var=new second("dominic","dugan");
		var.hehe();
		
		
		
		
		
		
		
		
		
	}

}

package train;

public class Encapsulate {

	//student info
	//with user input
	//private= para di ma access ng ibang user
	//get(modifier) syntax
	//set pa walang meaning
	
	
	
	
	
	
	
	private String firstname, lastname, section, course,hobby,gmail;
	private int age;
	private long cellphone;
	
	Encapsulate(String firstname, String lastname,String section, String course, String hobby, String gmail, int age, long cellphone){
	this.firstname=firstname;
	this.lastname=lastname;
	this.section=section;
	this.course=course;
	this.hobby=hobby;
	this.gmail=gmail;
	this.age=age;
	this.cellphone=cellphone;
	
	
	}
	
	String getFirstName() {
		return firstname;
	}
	
	String getLastName() {
		return lastname;
	}
	
	String getSection() {
		return section;
	}
	
	String getCourse() {
		return course;
	}
	
	String getHobby() {
		return hobby;
		
	}
	String getGmail() {
		return gmail;
	}
	
	int getAge() {
		return age;
	}
	
	long getCellphone(){
		return cellphone;
	}
	
	
	
	
	
	
	
	
	
}






