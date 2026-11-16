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

    public static int[] TwoSum_UsingDict(int[] input, int target)
    {
        int[] solution = new int[2];
        var seen = new Dictionary<int, int>();

        for (int i = 0; i < input.Length; i++)
        {
            int diff = target - input[i];

            if (seen.ContainsKey(diff))
            {
                solution[0] = seen[diff];
                solution[1] = i;
                return solution;
            }

            seen[input[i]] = i;
        }


        return solution;
    }

    public static bool CheckDuplicate(int[] nums)
    {
        var seen = new HashSet<int>();

        foreach (int num in nums)
        {
            if (seen.Contains(num))
            {
                return true;
            }

            seen.Add(num);
        }

        return false;
    }


    /// <summary>
    /// Given a list of words, group together the words that are anagrams of each other.
    /// For example words = ["eat", "tea", "tan", "nat"] -> [["eat","tea"], ["tan, "nat"]]
    /// </summary>
    /// <param name="inputString"></param>
    /// <returns></returns>
    public static Dictionary<string, List<string>> GroupDictionary(string[] wordArray)
    {
        var groups = new Dictionary<string, List<string>>();

        foreach (string word in wordArray)
        {
            char[] chars = word.ToCharArray();

            //You sort it so that it char array is in an identical order to the already stored array.
            //This means if the array is already in the dictionary, then it will be found.
            Array.Sort(chars);

            //turn it back to a string so it can be used as the key for that array.
            string key = new string(chars);

            if (!groups.Contains(key))
            {

            }
        }
    }
}