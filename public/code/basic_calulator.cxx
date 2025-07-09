#include<iostream.h>
#include<conio.h>

double x,y,result;
char choice,operators;
int error=0;

int screen_x=70;//Get the screen x axis size

int strlen(char *text)
{
    /*
    Count the numbers of characters in the 
    given text/string
    */
    int count = 0;
    while (text[count])
    {
        count += 1;
    }
    return count;
}

//Function to apply colors
void coloredtext(char *text = " ", int tc = 7, int bg = 7)
{
    /* Color values of textcolor and background: 
    0 = Black
    1 = Blue
    2 = Green
    3 = Cyan
    4 = Red
    5 = Magenta
    6 = Brown
    7 = Light Gray(Default)
    8-15 = Bright Versions
    */
    textcolor(tc);
    textbackground(bg);
    cout << text;
    textbackground(0);
    textcolor(7);
}

void set_title(char *title, int tc=7, int tb=0){
	int title_length = strlen(title);
	gotoxy(screen_x/2-(title_length/2),2);
	coloredtext(title,tc,tb);
	cout<<endl;
}

int main()
{
	pstart: //Program start label
	clrscr();
	//This process is to ensure to center the title in x axis regardless of it's size/length'
	set_title(" CALCULATOR ",0,2);
	//End of title process
	
	cout<<"Enter value of x: ";
	cin>>x;
	cout<<"Enter value of y: ";
	cin>>y;
	cout<<"Choose operator:\n";
	cout<<"+ = Sum of x and y\n";
	cout<<"/ = Quotient of x and y\n";
	cout<<"- = Subtraction of x and y\n";
	cout<<"* = Product of x and y\n";
	cout<<"Enter operator: ";
	cin>>operators;
	switch (operators){
	    case '+':
	        result = (x+y);
	        break;
	    case '/':
	        if (y==0){
	            error=1;
	            cout<<"Cannot divide any number to 0";
	        } else {
	            result = (x / y);
	        }
	        break;
	    case '-':
	        result = (x - y);
	        break;
	    case '*':
	        result = (x * y);
	        break;
	}
	
	if (cin.fail()){
	    clrscr();
	    set_title(" Error: Invalid input ",0,4);
	} else if (error!=1){
	    clrscr();
	    set_title(" RESULT ",0,2);
	    cout<<"Operator used: "<<operators<<endl;
	    cout<<"Result: "<<result<<endl;
	    cout<<"Perform another calculation?(y/n): ";
	    cin>>choice;
	    if (choice=='y'||choice=='Y'){
	        goto pstart;
	    } else if (choice=='n'||choice=='N'){
	        clrscr();
	        set_title(" Thank you for using our calculator ",0,2);
	    } else {
	        clrscr();
	        set_title(" Errror: Unknown choice ",0,4);
	    }
	} else {
	    clrscr();
	    set_title(" Error: Cannot divide any number to 0",0,4);
	}
	getch();
	return 0;
}