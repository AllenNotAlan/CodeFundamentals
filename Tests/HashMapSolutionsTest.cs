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
            int[] nums = { 3, 2, 4 };
            int[] expected = { 1, 2 };

            //act
            var result = HashMapSolutions.TwoSum_UsingDict(nums, 6);

            //assert
            Assert.Equal(expected, result);
        }
    }
}
