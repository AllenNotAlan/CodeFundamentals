using System;
using System.Text;

//namespace - this gives Program.cs access to this class
namespace CodeFundamentals;

public class ArraysSolution
{
    public static int[] ReturnProductArrayExceptSelf(int[] nums)
    {
        int n = nums.Length;
        int[] ints = new int[n];
        
        int[] left = new int[n];
        int[] right = new int[n];

        left[0] = 1;
        for(int i = 1; i < n; i++)
        {
            left[i] = left[i - 1] * nums[i-1];

            Console.WriteLine("left:"+left[i]);
        }

        right[n - 1] = 1;
        for(int i = n-2; i >= 0; i--)
        {
            right[i] = right[i+1] * nums[i+1];
            Console.WriteLine("right:"+right[i]);
        }

        for(int i = 0; i < n; i++)
        {
            ints[i] = left[i] * right[i];

            Console.WriteLine("sol:" + ints[i]);

        }

        return ints;
    }

    public static int[] ReturnProductArr(int[] nums)
    {
        int n = nums.Length;

        int[] left = new int[n];
        int[] right = new int[n];

        int[] solution = new int[n];

        left[0] = 1;
        for(int i = 1; i < n; i++)
        {
            left[i] = left[i - 1] * nums[i - 1];

            Console.WriteLine("left:"+left[i]);
        }

        right[n-1] = 1;
        for (int i = n-2; i >= 0; i--)
        {
            right[i] = right[i + 1] * nums[i + 1];
            Console.WriteLine("right:" + right[i]);
        }

        for(int i=0; i < n; i++)
        {
            solution[i] = left[i] * right[i];

            Console.WriteLine("Solution:" + solution[i]);
        }

        return solution;
    }

    public static int ReturnMaxInArray(int[] nums)
    {
        int max = nums[0];

        for (int i = 0; i < nums.Length; i++)
        {
            if (nums[i] > max)
            {
                max = nums[i];
            }
        }

        return max;
    }

    public static string ReversedString(string word)
    {
        //create the character array
        char[] stringArray = word.ToCharArray();
        
        //set positions as variables
        int left = 0;
        int right = stringArray.Length - 1;
        
        //while loop: 'while' left is less than right
        //basically - left moves closer to the right and right moves closer to the left
        //effectively switching positions
        while (left < right)
        {
            //set the left value to a temp variable so we keep track of it
            var temp = stringArray[left];
            stringArray[left] = stringArray[right]; //set the left as right
            stringArray[right] = temp; //set the right as left
            
            //move left/right to next position
            left++;
            right--;
        }

        //new string builder object
        var sb = new StringBuilder();
        sb.Append(stringArray); // append the string array to the string builder object
        
        return sb.ToString();
    }

    public static int[] ReturnSumArray(int[] input)
    {
        int[] prefixArr = new int[input.Length];

        prefixArr[0] = input[0];

        for (int i = 1; i < input.Length; i++)
        {
            prefixArr[i] = prefixArr[i - 1] + input[i];
        }

        return prefixArr;
    }

    //this can be optimised 
    //Solution is O(N) - there is a O(1) solution
    public static bool CheckIfPalindrome(string input)
    {
        char[] inputArray = input.ToCharArray();
        
        int left = 0;
        int right = input.Length - 1;

        while (left < right)
        {
            var temp = inputArray[left];
            inputArray[left] = inputArray[right];
            inputArray[right] = temp;

            left++;
            right--;
        }

        var sb = new StringBuilder();
        sb.Append(inputArray);

        if (String.Equals(input, sb.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        return false;
    }

    public static bool CheckIfPalindrome_Improved(string input)
    {
        char[] inputArray = input.ToCharArray();
        Array.Reverse(inputArray);
        
        string reversedString = new string(inputArray);

        if (string.Equals(reversedString, input, StringComparison.OrdinalIgnoreCase))
            return true;

        return false;
    }

    public static bool CheckIfPalindrome_Final(string input)
    {
        char[] inputArray = input.ToCharArray(); //this can be removed

        int left = 0;
        int right = input.Length - 1;

        while (left < right)
        {
            if (char.ToLower(inputArray[left]) != char.ToLower(inputArray[right]))
            {
                return false;
            }

            left++;
            right--;
        }

        return true;
    }

    public static bool CheckIfPalindrome_Final2_0(string input)
    {
        int left = 0;
        int right = input.Length - 1;

        while (left < right)
        {
            if (char.ToLower(input[left]) != char.ToLower(input[right]))
            {
                return false;
            }

            left++;
            right--;
        }

        return true;
    }

    public static int[] ReturnProductArrayExceptSelf_2(int[] input)
    {
        //create the result array - same length as input
        int[] result = new int[input.Length];

        int left = 0;
        int right = input.Length - 1;

        while (left < right)
        {
            
        }
        

        return result;
    }
    
}
