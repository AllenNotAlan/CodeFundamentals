using Xunit;
using CodeFundamentals;

namespace CodeFundamentals.Tests
{
    public class HashMapSolutionsTest
    {
        [Fact]
        public void FrequencyCount_ReturnCorrectFreq()
        {
            //arrange
            int[] nums = { 1, 1, 2, 2, 3, 3, 3, 4 };
            Dictionary<int, int> expected = new Dictionary<int, int>()
            {
                { 1, 2 },
                { 2, 2 },
                { 3, 3 },
                { 4, 1 }
            };

            //act
            Dictionary<int, int> result = HashMapSolutions.CountNumberOfEachelement(nums);

            //assert
            Assert.Equal(expected, result);
        }

        [Fact]
        public void TwoSum_ReturnCorrectFreq()
        {
            //arrange
            int[] nums = { 1, 2, 3, 4 };
            int[] expected = { 1, 3 };
            int target = 6;

            //act
            var result = HashMapSolutions.TwoSum_UsingDict(nums, target);

            //assert
            Assert.Equal(expected, result);
        }

        [Fact]
        public void CheckDuplicate_ReturnTrue()
        {
            //arrange
            int[] input = { 1, 2, 3, 4, 4 };
            bool expected = true;

            //act
            var result = HashMapSolutions.CheckDuplicate(input);

            //assert
            Assert.Equal(expected, result);
        }

        [Fact]
        public void CheckDuplicate_ReturnFalse()
        {
            //arrange
            int[] input = { 1, 2, 3, 4, 5 };
            bool expected = false;

            //act
            var result = HashMapSolutions.CheckDuplicate(input);

            //assert
            Assert.Equal(expected, result);
        }

        [Fact]
        public void GroupDictionary_return_correct()
        {
            //arrange
            string[] input = { "eat", "tea", "tan", "nat" };

            var result = HashMapSolutions.GroupDictionary(input);
            
        }
    }
}
