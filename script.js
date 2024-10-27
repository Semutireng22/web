let isRunning = false;

document.getElementById("startButton").addEventListener("click", () => {
  const authCode = document.getElementById("authCode").value.trim();
  if (!authCode) {
    logMessage("⚠️ Silakan masukkan kode auth untuk memulai.", "error");
    return;
  }

  isRunning = true;
  toggleButtons();
  startGrowActions(authCode);
});

document.getElementById("stopButton").addEventListener("click", () => {
  isRunning = false;
  toggleButtons();
  logMessage("🛑 Proses dihentikan. Terima kasih telah menggunakan HanaFuda Auto Grow! 🌸", "thank-you");
});

function toggleButtons() {
  document.getElementById("startButton").classList.toggle("hidden");
  document.getElementById("stopButton").classList.toggle("hidden");
}

function logMessage(message, type = "info") {
  const logContainer = document.getElementById("log");
  const logEntry = document.createElement("p");

  // Style the message based on type
  switch (type) {
    case "success":
      logEntry.style.color = "#00e676"; // green for success
      break;
    case "error":
      logEntry.style.color = "#ff5252"; // red for error
      break;
    case "thank-you":
      logEntry.classList.add("thank-you-message");
      logEntry.style.color = "#ffd700"; // gold for thank you
      break;
    default:
      logEntry.style.color = "#ffd700"; // gold for general info
      break;
  }

  logEntry.textContent = message;
  logContainer.appendChild(logEntry);
  logContainer.scrollTop = logContainer.scrollHeight;
}

async function startGrowActions(authCode) {
  logMessage("🌱 Memulai Grow Action...");

  // Mendapatkan jumlah Grow Actions
  const growActionCount = await getGrowActionCount(authCode);
  if (growActionCount === null) {
    logMessage("❌ Gagal mendapatkan jumlah Grow Action. Periksa auth code Anda.", "error");
    return;
  }
  logMessage(`🔢 Jumlah Grow Action Tersedia: ${growActionCount}`);

  // Menjalankan spin untuk setiap Grow Action
  for (let i = 1; i <= growActionCount; i++) {
    if (!isRunning) break;

    logMessage(`\n➡️ Memulai Spin ${i} dari ${growActionCount}`);
    const spinValue = await performSpin(authCode);
    const rewardStatus = await getReward(authCode);

    if (spinValue !== null && rewardStatus) {
      logMessage(`✅ Spin ${i}: Nilai Spin - ${spinValue}, Hadiah Berhasil Diambil`, "success");
    } else {
      logMessage(`❌ Spin ${i}: Gagal mengambil hadiah. Silakan cek koneksi Anda.`, "error");
    }

    await delay(2000); // Delay 2 detik
  }

  if (isRunning) {
    logMessage("🌸 Terima kasih telah menggunakan HanaFuda Auto Grow! Dari: Airdrop ASC 🌸", "thank-you");
    isRunning = false;
  }
}

async function getGrowActionCount(authCode) {
  try {
    const response = await fetch("https://hanafuda-backend-app-520478841386.us-central1.run.app/graphql", {
      method: "POST",
      headers: getHeaders(authCode),
      body: JSON.stringify({
        query: `query GetGardenForCurrentUser {
                  getGardenForCurrentUser {
                      gardenStatus {
                          growActionCount
                      }
                  }
              }`,
        operationName: "GetGardenForCurrentUser"
      })
    });
    const data = await response.json();
    return data?.data?.getGardenForCurrentUser?.gardenStatus?.growActionCount || null;
  } catch (error) {
    logMessage("❌ Terjadi kesalahan saat mendapatkan Grow Action Count.", "error");
    return null;
  }
}

async function performSpin(authCode) {
  try {
    const response = await fetch("https://hanafuda-backend-app-520478841386.us-central1.run.app/graphql", {
      method: "POST",
      headers: getHeaders(authCode),
      body: JSON.stringify({
        query: "mutation issueGrowAction { issueGrowAction }",
        operationName: "issueGrowAction"
      })
    });
    const data = await response.json();
    return data?.data?.issueGrowAction || null;
  } catch (error) {
    logMessage("❌ Terjadi kesalahan saat melakukan spin.", "error");
    return null;
  }
}

async function getReward(authCode) {
  try {
    const response = await fetch("https://hanafuda-backend-app-520478841386.us-central1.run.app/graphql", {
      method: "POST",
      headers: getHeaders(authCode),
      body: JSON.stringify({
        query: "mutation commitGrowAction { commitGrowAction }",
        operationName: "commitGrowAction"
      })
    });
    const data = await response.json();
    return data?.data?.commitGrowAction || false;
  } catch (error) {
    logMessage("❌ Terjadi kesalahan saat mengambil reward.", "error");
    return false;
  }
}

function getHeaders(authCode) {
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${authCode}`,
    "Origin": "https://hanafuda.hana.network",
    "Referer": "https://hanafuda.hana.network/",
    "sec-ch-ua": `"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"`,
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": `"Windows"`,
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "cross-site",
    "user-agent": getUserAgent()
  };
}

function getUserAgent() {
  const agents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
  ];
  return agents[Math.floor(Math.random() * agents.length)];
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
