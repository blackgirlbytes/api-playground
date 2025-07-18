class KidFriendlyReporter {
  constructor(globalConfig, options) {
    this.globalConfig = globalConfig;
    this.options = options;
  }

  onRunStart(results, options) {
    console.log('\n🎯 Starting our awesome test adventure!');
    console.log('🔍 Looking for bugs and making sure everything works perfectly...\n');
  }

  onTestStart(test) {
    const testName = test.path.split('/').pop();
    console.log(`🧪 Testing: ${testName}`);
  }

  onTestResult(test, testResult) {
    const testName = test.path.split('/').pop();
    const { numPassingTests, numFailingTests, numPendingTests } = testResult;
    
    if (numFailingTests === 0) {
      console.log(`✅ ${testName}: All ${numPassingTests} tests passed! 🎉`);
    } else {
      console.log(`❌ ${testName}: ${numFailingTests} tests failed, ${numPassingTests} passed`);
      
      testResult.testResults.forEach(result => {
        if (result.status === 'failed') {
          console.log(`   💥 ${result.title}: ${result.failureMessages[0]?.split('\n')[0] || 'Unknown error'}`);
        }
      });
    }
    
    if (numPendingTests > 0) {
      console.log(`   ⏳ ${numPendingTests} tests are waiting to be written`);
    }
  }

  onRunComplete(contexts, results) {
    const { numTotalTests, numPassedTests, numFailedTests, numPendingTests } = results;
    
    console.log('\n🏁 Test Adventure Complete!');
    console.log('═══════════════════════════════════════');
    
    if (numFailedTests === 0) {
      console.log(`🎉 AMAZING! All ${numPassedTests} tests passed!`);
      console.log('🌟 Your code is working perfectly!');
      
      if (numPendingTests > 0) {
        console.log(`📝 Don't forget: ${numPendingTests} tests are still waiting to be written`);
      }
    } else {
      console.log(`😅 Oops! ${numFailedTests} tests need some fixing`);
      console.log(`✅ But ${numPassedTests} tests are working great!`);
      console.log('💪 Keep going - you\'ve got this!');
    }
    
    console.log(`\n📊 Total tests: ${numTotalTests}`);
    console.log(`✅ Passed: ${numPassedTests}`);
    console.log(`❌ Failed: ${numFailedTests}`);
    console.log(`⏳ Pending: ${numPendingTests}`);
    
    if (results.coverageMap) {
      console.log('\n📈 Code Coverage Report:');
      console.log('(This shows how much of your code was tested)');
    }
    
    console.log('\n🚀 Happy coding! 🚀\n');
  }
}

module.exports = KidFriendlyReporter;
