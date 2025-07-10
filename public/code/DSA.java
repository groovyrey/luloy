import java.util.ArrayList;
import java.util.Stack;

// Non-linear Data Structure: Binary Tree
class TreeNode {
    int value;
    TreeNode left, right;

    TreeNode(int value) {
        this.value = value;
        left = right = null;
    }
}

public class DataStructureExamples {

    public static void main(String[] args) {

        // 1. Primitive Data Structures
        int age = 21;               // int is a primitive
        char grade = 'A';           // char is a primitive
        System.out.println("Primitive Data: Age = " + age + ", Grade = " + grade);

        // 2. Linear Data Structure - ArrayList
        ArrayList<String> names = new ArrayList<>();
        names.add("Alice");
        names.add("Bob");
        names.add("Charlie");

        System.out.println("\nLinear Data (ArrayList):");
        for (String name : names) {
            System.out.println(name);
        }

        // 3. Abstract Data Structure - Stack
        Stack<Integer> stack = new Stack<>();
        stack.push(10);
        stack.push(20);
        stack.push(30);
        System.out.println("\nAbstract Data (Stack):");
        while (!stack.isEmpty()) {
            System.out.println(stack.pop());
        }

        // 4. Non-linear Data Structure - Binary Tree
        TreeNode root = new TreeNode(1);
        root.left = new TreeNode(2);
        root.right = new TreeNode(3);
        System.out.println("\nNon-linear Data (Binary Tree - Preorder):");
        printPreOrder(root);
    }

    // Recursive method to print Binary Tree (Pre-order traversal)
    public static void printPreOrder(TreeNode node) {
        if (node != null) {
            System.out.println(node.value);
            printPreOrder(node.left);
            printPreOrder(node.right);
        }
    }
}