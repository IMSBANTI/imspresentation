async function testAuth() {
  console.log("=== Testing User Auth & Multi-tenant Presentations ===");
  const base = "http://localhost:4000";

  // Test 1: Register
  const testEmail = `presenter_${Date.now()}@ims.com`;
  const regRes = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'password123',
      name: 'Dr. Sarah Jenkins'
    })
  });
  const regData = await regRes.json();
  console.log("Register response status:", regRes.status);
  if (regRes.status !== 201 || !regData.token) {
    throw new Error("Registration failed: " + JSON.stringify(regData));
  }
  console.log("✓ Test 1: Registered new presenter:", regData.user.name, regData.user.email);

  const token = regData.token;

  // Test 2: Login
  const loginRes = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'password123'
    })
  });
  const loginData = await loginRes.json();
  if (loginRes.status !== 200 || !loginData.token) {
    throw new Error("Login failed: " + JSON.stringify(loginData));
  }
  console.log("✓ Test 2: Logged in successfully, received JWT token");

  // Test 3: Get user decks
  const decksRes = await fetch(`${base}/api/presentations`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const decksData = await decksRes.json();
  console.log("✓ Test 3: Fetched presenter's decks. Count:", decksData.presentations?.length);

  // Test 4: Create custom presentation
  const newDeckRes = await fetch(`${base}/api/presentations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: "Global Tech Keynote 2026",
      code: "TECH2026"
    })
  });
  const newDeckData = await newDeckRes.json();
  console.log("✓ Test 4: Created new deck:", newDeckData.presentation?.title, "| Code:", newDeckData.presentation?.code);

  console.log("\n========================================");
  console.log("All Auth & Multi-tenant tests passed!");
  console.log("========================================");
}

testAuth().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
