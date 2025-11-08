// Test script for feedback API
// Run with: node test-feedback-api.js

const testTranscript = "Hello, my name is John. I like to play basketball and read books. Sometimes I go to the park with my friends.";

async function testFeedbackAPI() {
  try {
    console.log("Testing feedback API...");
    console.log("Transcript:", testTranscript);
    console.log("");

    const response = await fetch("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcript: testTranscript }),
    });

    console.log("Response status:", response.status);
    console.log("Response status text:", response.statusText);
    console.log("");

    const data = await response.json();
    console.log("Response data:");
    console.log(JSON.stringify(data, null, 2));

    if (data.ok) {
      console.log("\n✅ Feedback API is working!");
      if (typeof data.feedback === "object") {
        console.log("✅ Response is properly structured JSON");
      } else {
        console.log("⚠️  Response is raw text (not JSON)");
      }
    } else {
      console.log("\n❌ Feedback API returned an error");
    }
  } catch (error) {
    console.error("❌ Error testing feedback API:");
    console.error(error.message);
  }
}

testFeedbackAPI();
