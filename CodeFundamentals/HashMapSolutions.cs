using System;
using System.Collections.Generic;
using System.Text;

namespace CodeFundamentals;

public class HashMapSolutions
{
    public static Dictionary<int, int> CountNumberOfEachelement(int[] input)
    {
        var freq = new Dictionary<int, int>();

        foreach(int n in input)
        {
            //if n is not in the dictionary freq, then add it as a new element
            if (!freq.ContainsKey(n))
            {
                freq[n] = 0;
            }

            //if n is already in the dictionary the add to its count
            freq[n]++;
        }

        return freq;
    }

    public static int[] TwoSum_UsingDict(int[] nums, int target)
    {
        int[] solution = new int[2];

        var dict = new Dictionary<int, int>();

        foreach (int n in nums)
        {

        }


        return solution;
    }
}

