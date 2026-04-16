// ==========================================
// 🚀 INITIALIZATION & SETUP
// ==========================================
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TELEGRAM_TOKEN;
// Parse multiple admins into an array
const adminIds = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(",") : [];
const superAdminId = process.env.SUPER_ADMIN_ID;

if (!token || adminIds.length === 0) {
  console.error(
    "FATAL ERROR: Missing TELEGRAM_TOKEN or ADMIN_IDS in the .env file.",
  );
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// ==========================================
// 📌 SET BOT COMMANDS (The Menu Button)
// ==========================================
bot
  .setMyCommands([
    { command: "/start", description: "Start the bot / Register" },
    { command: "/menu", description: "Open the Main Menu" },
  ])
  .then(() => {
    console.log("✅ Bot Menu Commands successfully set!");
  })
  .catch((error) => {
    console.error("❌ Failed to set Bot Commands:", error);
  });

// ==========================================
// 🧠 STATE MANAGEMENT & DATABASE
// ==========================================
const userState = {};
const userProfiles = {};
const adminState = {};

const phoneData = {
  "Apple 🍎": {
    "iPhone 17 Series": ["17 Air", "17 Pro Max", "17 Pro", "17"],
    "iPhone 16 Series": ["16 Pro Max", "16 Pro", "16 Plus", "16"],
    "iPhone 15 Series": ["15 Pro-Max", "15 Pro", "15 Plus", "15"],
    "iPhone 14 Series": ["14 Pro-Max", "14 Pro", "14 Plus", "14"],
    "iPhone 13 Series": ["13 Pro-Max", "13 Pro", "13", "13 Mini"],
    "iPhone 12 Series": ["12 Pro-Max", "12 Pro", "12", "12 Mini"],
    "iPhone 11 Series": ["11 Pro-Max", "11 Pro", "11"],
    "Older Models": [
      "XS-Max",
      "XR",
      "X-XS",
      "7-8P",
      "7G-8G-SE2",
      "6G-6S",
      "5G-5S-SE",
    ],
  },
  "Samsung 📱": {
    "Galaxy S Series": [
      "S25 Ultra",
      "S25+",
      "S25",
      "S24 Ultra",
      "S24+",
      "S24",
      "S23 Ultra",
      "S23+",
      "S23 FE",
      "S23",
      "S22 Ultra",
      "S22+",
      "S22",
      "S21 Ultra",
      "S21+",
      "S21 FE",
      "S21",
      "S20 Ultra",
      "S20+",
      "S20 FE",
      "S20",
    ],
    "Galaxy A Series": [
      "A73 (5G)",
      "A73",
      "A72 (4G/5G)",
      "A71 (5G)",
      "A71",
      "A55 (5G)",
      "A55",
      "A54 (5G)",
      "A54",
      "A53 (5G)",
      "A52 (5G)",
      "A51 (5G)",
      "A51 (4G)",
      "A35 (5G)",
      "A35",
      "A34 (5G)",
      "A34",
      "A33 (5G)",
      "A33",
      "A25 (5G)",
      "A25",
      "A21S",
      "A15 (4G/5G)",
      "A15",
      "A14 (5G)",
      "A14",
      "A13 (4G)",
      "A13",
      "A12",
    ],
    "Galaxy Note Series": [
      "Note 20 Ultra",
      "Note 20",
      "Note 10 Pro",
      "Note 10",
    ],
  },
  "Redmi 🔴": [
    "Note 10 Pro",
    "Note 12 Pro",
    "Note 12 Pro+",
    "Note 13",
    "Note 13 Pro",
    "Note13 Pro+",
  ],
  "Xiaomi 🟠": ["13", "13 Pro", "13 T INT", "14", "14 Pro", "14 Ultra"],
  "Huawei 🔵": ["P30", "P30 Pro", "P30 Lite"],
};

// ==========================================
// 🌍 TRANSLATION DICTIONARY
// ==========================================
const dict = {
  en: {
    welcome:
      "🎨 Welcome to Yonas Mobile Custom Cases!\n\nCreate your custom phone case in under 1 minute. Delivered anywhere in Ethiopia.",
    ask_name: "To get started, please reply with your Full Name:",
    ask_phone: "Next, please reply with your Phone Number:",
    ask_location:
      "Great! Finally, please reply with your Delivery Location (or paste a Google Maps link):",
    profile_updated: "✅ Profile updated successfully!",
    menu_title: "📋 MAIN MENU\nWhat would you like to do today?",
    btn_order: "🛍️ Order Custom Case",
    btn_edit: "⚙️ Edit My Details",
    btn_lang: "🌐 Change Language",
    choose_brand: "📱 Choose your phone brand:",
    choose_series: "Choose your Series:",
    choose_model: "Select your exact model:",
    send_image:
      "📸 Great! Now, please send the image you want printed on your custom case.\n(You can send it as a Photo or a File/Document)",
    design_approved:
      "✅ Design Approved!\n\n💰 Price: 600 Birr\n\n📝 We will deliver to:",
    btn_proceed: "Proceed to Payment 💳",
    btn_edit_delivery: "Edit Delivery Details ⚙️",
    payment_msg:
      "💳 PAYMENT REQUIRED\n\nTo complete your order, please pay 600 Birr to:\n📱 Telebirr: 0912345678\n🏦 CBE: 1000123456789\n\n📸 After paying, please upload a screenshot of your receipt.",
    payment_received:
      "⏳ Payment screenshot received! We are verifying it now. You will be notified shortly.",
    image_received:
      "📸 Image received!\n\n⏳ Our team is generating your custom design preview. We will notify you here once it's ready!",
    type_message: "💬 Please type your message to the designer below:",
    msg_sent: "✅ Message sent! Our team will reply shortly.",
    back_brand: "🔙 Back to Brands",
    back_series: "🔙 Back to Series",
    btn_approve: "Approve ✅",
    btn_reply: "Reply 💬",
  },
  am: {
    welcome:
      "🎨 ወደ ዮናስ ሞባይል እንኳን በደህና መጡ!\n\nየፈለጉትን ስልክ መያዣ Cover ከ1 ደቂቃ ባነሰ ጊዜ ውስጥ ይዘዙ። ኢትዮጵያ ውስጥ የትኛውም ቦታ እናደርሳለን።",
    ask_name: "ለመጀመር፣ እባክዎ ሙሉ ስምዎን ያስገቡ፡",
    ask_phone: "በመቀጠል ስልክ ቁጥርዎን ያስገቡ፡",
    ask_location: "በመጨረሻም፣ የመላኪያ አድራሻዎን ያስገቡ (ወይም Google Map ሊንክ ይላኩ)፡",
    profile_updated: "✅ መረጃዎ በትክክል ተስተካክሏል!",
    menu_title: "📋 ዋና ማውጫ\nምን ማድረግ ይፈልጋሉ?",
    btn_order: "🛍️ ስልክ መያዣ Cover ለማዘዝ",
    btn_edit: "⚙️ መረጃን ለማስተካከል",
    btn_lang: "🌐 ቋንቋ ለመቀየር",
    choose_brand: "📱 የስልክዎን አይነት ይምረጡ፡",
    choose_series: "አይነቱን (Series) ይምረጡ፡",
    choose_model: "የስልክ ሞዴል ይምረጡ፡",
    send_image:
      "📸 አሁን፣ በስልክዎ መያዣ ላይ እንዲታተም የሚፈልጉትን ፎቶ ይላኩ።\n(እንደ ፎቶ ወይም ፋይል/ዶክመንት መላክ ይችላሉ)",
    design_approved: "✅ ዲዛይኑ አልቋል!\n\n💰 ዋጋ: 600 ብር\n\n📝 የምናደርስበት አድራሻ:",
    btn_proceed: "ወደ ክፍያ ይቀጥሉ 💳",
    btn_edit_delivery: "የመላኪያ አድራሻ ቀይር ⚙️",
    payment_msg:
      "💳 ክፍያ ያስፈልጋል\n\nትዕዛዝዎን ለማጠናቀቅ እባክዎ 600 ብር በሚከተሉት አካውንቶች ይክፈሉ፡\n📱 ቴሌብር: 0912345678\n🏦 ንግድ ባንክ: 1000123456789\n\n📸 ከከፈሉ በኋላ፣ የላኩበትን ደረሰኝ ስክሪንሾት (Screenshot) እዚህ ይላኩ።",
    payment_received: "⏳ የክፍያ ስክሪንሾት ደርሶናል! አሁን እያረጋገጥን ነው። በቅርቡ እናሳውቅዎታለን።",
    image_received:
      "📸 ፎቶው ደርሶናል!\n\n⏳ የዲዛይነር ቡድናችን እያዘጋጀው ነው። እንዳለቀ እዚሁ እናሳውቅዎታለን!",
    type_message: "💬 እባክዎ ለዲዛይነሩ ማስተላለፍ የሚፈልጉትን መልእክት ከታች ይጻፉ፡",
    msg_sent: "✅ መልእክቱ ተልኳል! ቡድናችን በቅርቡ ይመልስልዎታል።",
    back_brand: "🔙 ወደ ስልክ አይነቶች ተመለስ",
    back_series: "🔙 ወደ Series ተመለስ",
    btn_approve: "ተስማምቻለሁ ✅",
    btn_reply: "መልስ ስጥ 💬",
  },
  or: {
    welcome:
      "🎨 Baga gara Yonas Mobile nagaan dhuftan!\n\nKavaarii bilbilaa suuraa keessan qabu daqiiqaa 1 gadi keessatti ajajadhaa. Itoophiyaa keessatti bakka barbaaddan isiniif geessina.",
    ask_name: "Jalqabuuf, maaloo maqaa keessan guutuu galchaa:",
    ask_phone: "Itti aansee lakkoofsa bilbilaa keessan galchaa:",
    ask_location:
      "Xumura irratti, iddoo itti isiniif ergamu galchaa (ykn linkii Google Maps ergaa):",
    profile_updated: "✅ Odeeffannoon keessan sirreeffameera!",
    menu_title: "📋 BAAFATA MUUMMEE\nMaal gochu barbaaddu?",
    btn_order: "🛍️ Kavaarii Ajajadhu",
    btn_edit: "⚙️ Odeeffannoo koo sirreessi",
    btn_lang: "🌐 Afaan jijjiiri",
    choose_brand: "📱 Gosa bilbila keessanii filadhaa:",
    choose_series: "Siriisii (Series) filadhaa:",
    choose_model: "Moodela bilbila keessanii sirrii filadhaa:",
    send_image:
      "📸 Baay'ee gaariidha! Amma, suuraa kavaarii keessan irratti maxxanfamu barbaaddan ergaa.\n(Akka suuraatti ykn faayiliitti erguu dandeessu)",
    design_approved:
      "✅ Dizaayiniin mirkanaa'eera!\n\n💰 Gatii: Qarshii 600\n\n📝 Iddoon itti geessinu:",
    btn_proceed: "Kaffaltii raawwadhaa 💳",
    btn_edit_delivery: "Iddoo itti ergamu sirreessi ⚙️",
    payment_msg:
      "💳 KAFFALTIIN NI BARBAADAMA\n\nAjaja keessan xumuruuf, maaloo qarshii 600 herrega armaan gadiitti kaffalaa:\n📱 Telebirr: 0912345678\n🏦 Baankii Daldalaa (CBE): 1000123456789\n\n📸 Erga kaffaltanii booda, suuraa (Screenshot) nagahee asitti ergaa.",
    payment_received:
      "⏳ Suuraan kaffaltii nu qaqqabeera! Amma mirkaneessaa jirra. Yeroo dhiyootti isin beeksifna.",
    image_received:
      "📸 Suuraan nu qaqqabeera!\n\n⏳ Gareen dizaayinii keenya dizaayinii yaalii qopheessaa jira. Akkuma xumurameen asuma irratti isin beeksifna!",
    type_message: "💬 Maaloo ergaa keessan dizaayineraaf barreessaa:",
    msg_sent:
      "✅ Ergaan ergameera! Gareen keenya dhiyootti deebii isiniif kenna.",
    back_brand: "🔙 Gara Gosoota Bilbilaatti deebi'i",
    back_series: "🔙 Gara Series deebi'i",
    btn_approve: "Mirkaneessi ✅",
    btn_reply: "Deebisi 💬",
  },
};

// ==========================================
// 📢 MULTI-ADMIN BROADCASTING HELPERS
// ==========================================
const notifyAdmins = async (text, options = {}) => {
  for (const id of adminIds) {
    try {
      await bot.sendMessage(id, text, options);
    } catch (e) {
      console.error(`Failed to notify admin ${id}`);
    }
  }
};

const notifyAdminsWithMedia = async (fileId, isDocument, options = {}) => {
  for (const id of adminIds) {
    try {
      if (isDocument) await bot.sendDocument(id, fileId, options);
      else await bot.sendPhoto(id, fileId, options);
    } catch (e) {
      console.error(`Failed to notify admin ${id} with media`);
    }
  }
};

const t = (chatId, key) => {
  const lang =
    userProfiles[chatId] && userProfiles[chatId].lang
      ? userProfiles[chatId].lang
      : "en";
  return dict[lang][key] || dict["en"][key];
};

const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size)
    result.push(arr.slice(i, i + size));
  return result;
};

console.log("🤖 Yonas Mobile Custom Cases Bot is starting...");

// ==========================================
// 📋 MENUS & HELPERS
// ==========================================
const askLanguage = (chatId) => {
  const langMsg =
    "Please select your language:\nእባክዎ ቋንቋዎን ይምረጡ:\nMaaloo afaan filadhaa:";
  const langKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🇬🇧 English", callback_data: "setlang_en" }],
        [{ text: "🇪🇹 አማርኛ", callback_data: "setlang_am" }],
        [{ text: "🇪🇹 Afaan Oromoo", callback_data: "setlang_or" }],
      ],
    },
  };
  bot.sendMessage(chatId, langMsg, langKeyboard);
};

const showMainMenu = (chatId) => {
  const profile = userProfiles[chatId];
  const menuMessage = `👋 Welcome back, ${profile.name}!\n\n${t(chatId, "menu_title")}`;
  const menuKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: t(chatId, "btn_order"), callback_data: "start_order" }],
        [{ text: t(chatId, "btn_edit"), callback_data: "edit_profile" }],
        [{ text: t(chatId, "btn_lang"), callback_data: "change_language" }],
      ],
    },
  };
  bot.sendMessage(chatId, menuMessage, menuKeyboard);
};

const showBrandMenu = (chatId, messageId = null) => {
  const brands = Object.keys(phoneData);
  const buttons = brands.map((b) => ({ text: b, callback_data: `br::${b}` }));
  const keyboard = { inline_keyboard: chunkArray(buttons, 2) };

  if (messageId)
    bot.editMessageText(t(chatId, "choose_brand"), {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: keyboard,
    });
  else
    bot.sendMessage(chatId, t(chatId, "choose_brand"), {
      reply_markup: keyboard,
    });
};

const showCheckoutConfirmation = (chatId) => {
  const profile = userProfiles[chatId];
  const confirmMessage = `${t(chatId, "design_approved")}\n👤 ${profile.name}\n📞 ${profile.phone}\n📍 ${profile.location}`;
  const confirmationKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: t(chatId, "btn_proceed"),
            callback_data: "proceed_to_payment",
          },
        ],
        [
          {
            text: t(chatId, "btn_edit_delivery"),
            callback_data: "edit_checkout_profile",
          },
        ],
      ],
    },
  };
  bot.sendMessage(chatId, confirmMessage, confirmationKeyboard);
};

// ==========================================
// 🎬 /START COMMAND
// ==========================================
bot.onText(/\/(start|menu)/, (msg) => {
  const chatId = msg.chat.id.toString();

  if (!userProfiles[chatId]) userProfiles[chatId] = {};

  if (!userProfiles[chatId].lang) {
    userState[chatId] = { step: "awaiting_language" };
    return askLanguage(chatId);
  }

  if (
    userProfiles[chatId].name &&
    userProfiles[chatId].phone &&
    userProfiles[chatId].location
  ) {
    return showMainMenu(chatId);
  }

  bot.sendMessage(chatId, t(chatId, "welcome")).then(() => {
    userState[chatId] = { step: "awaiting_name" };
    bot.sendMessage(chatId, t(chatId, "ask_name"));
  });
});

// ==========================================
// 🖱️ BUTTON CLICK HANDLER
// ==========================================
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id.toString();
  const messageId = query.message.message_id;
  const data = query.data;

  // --- 0. LANGUAGE SELECTION ---
  if (data.startsWith("setlang_")) {
    const selectedLang = data.split("_")[1];
    if (!userProfiles[chatId]) userProfiles[chatId] = {};
    userProfiles[chatId].lang = selectedLang;

    if (userState[chatId] && userState[chatId].step === "awaiting_language") {
      bot.sendMessage(chatId, t(chatId, "welcome")).then(() => {
        userState[chatId] = { step: "awaiting_name" };
        bot.sendMessage(chatId, t(chatId, "ask_name"));
      });
    } else {
      bot.sendMessage(chatId, "✅").then(() => {
        showMainMenu(chatId);
      });
    }
  } else if (data === "change_language") askLanguage(chatId);
  // --- 1. MAIN MENU ACTIONS ---
  else if (data === "start_order") showBrandMenu(chatId, messageId);
  else if (data === "edit_profile") {
    userState[chatId] = {
      step: "awaiting_name",
      isUpdating: true,
      returnToCheckout: false,
    };
    bot.sendMessage(chatId, t(chatId, "ask_name"));
  } else if (data === "edit_checkout_profile") {
    userState[chatId] = {
      step: "awaiting_name",
      isUpdating: true,
      returnToCheckout: true,
    };
    bot.sendMessage(chatId, t(chatId, "ask_name"));
  }

  // --- 2. ADVANCED BRAND -> SERIES -> MODEL SELECTION ---
  else if (data.startsWith("br::")) {
    const selectedBrand = data.split("::")[1];
    if (!userState[chatId]) userState[chatId] = {};
    userState[chatId].brand = selectedBrand;
    const brandData = phoneData[selectedBrand];

    if (!Array.isArray(brandData)) {
      const seriesNames = Object.keys(brandData);
      const buttons = seriesNames.map((s) => ({
        text: s,
        callback_data: `sr::${selectedBrand}::${s}`,
      }));
      const keyboard = chunkArray(buttons, 1);
      keyboard.push([
        { text: t(chatId, "back_brand"), callback_data: "start_order" },
      ]);
      bot.editMessageText(`${t(chatId, "choose_series")}`, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: keyboard },
      });
    } else {
      const buttons = brandData.map((m) => ({
        text: m,
        callback_data: `md::${m}`,
      }));
      const keyboard = chunkArray(buttons, 2);
      keyboard.push([
        { text: t(chatId, "back_brand"), callback_data: "start_order" },
      ]);
      bot.editMessageText(`${t(chatId, "choose_model")}`, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: { inline_keyboard: keyboard },
      });
    }
  } else if (data.startsWith("sr::")) {
    const parts = data.split("::");
    const selectedBrand = parts[1];
    const selectedSeries = parts[2];
    const models = phoneData[selectedBrand][selectedSeries];
    const buttons = models.map((m) => ({ text: m, callback_data: `md::${m}` }));
    const keyboard = chunkArray(buttons, 2);
    keyboard.push([
      { text: t(chatId, "back_series"), callback_data: `br::${selectedBrand}` },
    ]);
    bot.editMessageText(`${t(chatId, "choose_model")}`, {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: { inline_keyboard: keyboard },
    });
  } else if (data.startsWith("md::")) {
    const selectedModel = data.split("::")[1];
    if (!userState[chatId]) userState[chatId] = {};
    userState[chatId].model = selectedModel;
    const brand = userState[chatId].brand || "Unknown Brand";
    bot.editMessageText(
      `✅ ${brand} - ${selectedModel}\n\n${t(chatId, "send_image")}`,
      { chat_id: chatId, message_id: messageId },
    );
  }

  // --- 3. CHAT / APPROVAL FLOW ---
  else if (data === "approve") showCheckoutConfirmation(chatId);
  else if (data === "reply_admin_chat") {
    userState[chatId] = { step: "awaiting_chat_message" };
    bot.sendMessage(chatId, t(chatId, "type_message"));
  }

  // --- 4. PAYMENT PROCESS ---
  else if (data === "proceed_to_payment") {
    userState[chatId] = { step: "awaiting_payment_screenshot" };
    bot.sendMessage(chatId, t(chatId, "payment_msg"));
  }

  // --- 5. MULTI-ADMIN ACTIONS ---
  else if (data.startsWith("reply_")) {
    if (!adminIds.includes(chatId))
      return bot.answerCallbackQuery(query.id, {
        text: "Access Denied",
        show_alert: true,
      });
    const targetUserId = data.split("_")[1];
    adminState[chatId] = {
      action: "replying_to_user",
      targetUserId: targetUserId,
    };
    bot.sendMessage(
      chatId,
      `✍️ You are now replying to User ${targetUserId}.\n\nPlease send the text, photo, or document you want to send them.\n(Type /cancel to abort)`,
    );
  } else if (data.startsWith("approve_payment_")) {
    if (!adminIds.includes(chatId))
      return bot.answerCallbackQuery(query.id, { text: "Access Denied" });
    const targetUserId = data.split("_")[2];
    adminState[chatId] = {
      action: "awaiting_delivery_duration",
      targetUserId: targetUserId,
    };
    bot.sendMessage(
      chatId,
      `✅ Payment approved for ${targetUserId}.\n\n⏳ Please reply with the estimated delivery duration (e.g., "1-2 days"):`,
    );
  } else if (data.startsWith("reject_payment_")) {
    if (!adminIds.includes(chatId))
      return bot.answerCallbackQuery(query.id, { text: "Access Denied" });
    const targetUserId = data.split("_")[2];

    const rejectMsg =
      userProfiles[targetUserId] && userProfiles[targetUserId].lang === "am"
        ? "❌ የክፍያ ስክሪንሾቱ ግልጽ አይደለም። እባክዎ በድጋሚ ይላኩ።"
        : userProfiles[targetUserId] && userProfiles[targetUserId].lang === "or"
          ? "❌ Suuraan kaffaltii sirrii miti. Maaloo irra deebiin ergaa."
          : "❌ Payment Verification Failed. Please ensure the screenshot is clear and upload it again.";

    bot.sendMessage(targetUserId, rejectMsg);

    if (!userState[targetUserId]) userState[targetUserId] = {};
    userState[targetUserId].step = "awaiting_payment_screenshot";

    notifyAdmins(
      `❌ Admin ${chatId} rejected payment for User ${targetUserId}. They have been asked to re-upload.`,
    );
  }

  bot.answerCallbackQuery(query.id);
});

// ==========================================
// 👑 MULTI-ADMIN SUBMISSION LOGIC
// ==========================================
const handleAdminReplySubmission = async (msg, currentAdminId) => {
  const targetUserId = adminState[currentAdminId].targetUserId;
  const textOrCaption =
    msg.text || msg.caption || "Here is your message from the Admin!";

  const userChatKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: t(targetUserId, "btn_approve"), callback_data: "approve" },
          {
            text: t(targetUserId, "btn_reply"),
            callback_data: "reply_admin_chat",
          },
        ],
      ],
    },
  };

  try {
    if (msg.photo) {
      const fileId = msg.photo[msg.photo.length - 1].file_id;
      await bot.sendPhoto(targetUserId, fileId, {
        caption: textOrCaption,
        ...userChatKeyboard,
      });
    } else if (msg.document) {
      const fileId = msg.document.file_id;
      await bot.sendDocument(targetUserId, fileId, {
        caption: textOrCaption,
        ...userChatKeyboard,
      });
    } else if (msg.text) {
      await bot.sendMessage(targetUserId, msg.text, userChatKeyboard);
    }

    await bot.sendMessage(
      currentAdminId,
      `✅ Successfully sent to user ${targetUserId}`,
    );
    delete adminState[currentAdminId];
  } catch (error) {
    console.error("Admin Reply Error:", error);
    await bot.sendMessage(
      currentAdminId,
      `❌ Failed to send to ${targetUserId}. Error: ${error.message}`,
    );
  }
};

// ==========================================
// 🖼️ IMAGE UPLOAD HANDLER
// ==========================================
const handleImageUpload = async (msg) => {
  const chatId = msg.chat.id.toString();

  if (
    adminIds.includes(chatId) &&
    adminState[chatId] &&
    adminState[chatId].action === "replying_to_user"
  ) {
    return handleAdminReplySubmission(msg, chatId);
  }

  let fileId;
  let isDocument = false;
  if (msg.photo) {
    fileId = msg.photo[msg.photo.length - 1].file_id;
  } else if (msg.document) {
    fileId = msg.document.file_id;
    isDocument = true;
  }

  if (
    userState[chatId] &&
    userState[chatId].step === "awaiting_payment_screenshot"
  ) {
    const profile = userProfiles[chatId];
    const userName = msg.from.username
      ? `@${msg.from.username}`
      : msg.from.first_name;

    const paymentAlert = `💸 NEW PAYMENT UPLOADED 💸\n👤 User: ${userName}\n🆔 ID: ${chatId}\n\n📝 Order Details:\nName: ${profile.name}\nPhone: ${profile.phone}\n\nPlease verify the attached receipt.`;
    const paymentKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "✅ Approve Payment",
              callback_data: `approve_payment_${chatId}`,
            },
          ],
          [
            {
              text: "❌ Reject Payment",
              callback_data: `reject_payment_${chatId}`,
            },
          ],
        ],
      },
    };

    bot.sendMessage(chatId, t(chatId, "payment_received"));
    userState[chatId].step = "verifying_payment";

    notifyAdminsWithMedia(fileId, isDocument, {
      caption: paymentAlert,
      ...paymentKeyboard,
    });
    return;
  }

  if (
    !userState[chatId] ||
    !userState[chatId].brand ||
    !userState[chatId].model
  ) {
    return bot.sendMessage(
      chatId,
      "⚠️ Please go to the Main Menu and choose 'Order Custom Case' first.",
    );
  }

  await bot.sendMessage(chatId, t(chatId, "image_received"));

  const profile = userProfiles[chatId];
  const userName = msg.from.username
    ? `@${msg.from.username}`
    : msg.from.first_name;
  const adminCaption = `🚨 NEW CUSTOM CASE ORDER 🚨\n👤 User: ${userName}\n🆔 User ID: ${chatId}\n\n📱 Brand: ${userState[chatId].brand}\n📲 Model: ${userState[chatId].model}\n\n📝 Customer Details:\nName: ${profile.name}\nPhone: ${profile.phone}\nLocation: ${profile.location}`;

  const adminKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "💬 Reply to User", callback_data: `reply_${chatId}` }],
      ],
    },
  };

  notifyAdminsWithMedia(fileId, isDocument, {
    caption: adminCaption,
    ...adminKeyboard,
  });
  userState[chatId] = {};
};

bot.on("photo", handleImageUpload);
bot.on("document", handleImageUpload);

// ==========================================
// 📝 TEXT LISTENER
// ==========================================
bot.on("message", async (msg) => {
  const chatId = msg.chat.id.toString();
  const text = msg.text;

  if (!text || text.startsWith("/")) return;

  if (adminIds.includes(chatId) && adminState[chatId]) {
    if (text === "/cancel") {
      delete adminState[chatId];
      return bot.sendMessage(chatId, "🚫 Action cancelled.");
    }

    if (adminState[chatId].action === "replying_to_user") {
      return handleAdminReplySubmission(msg, chatId);
    }

    if (adminState[chatId].action === "awaiting_delivery_duration") {
      const targetUserId = adminState[chatId].targetUserId;
      const duration = text;

      const finalReceipt =
        userProfiles[targetUserId] && userProfiles[targetUserId].lang === "am"
          ? `🎉 ክፍያው ተረጋግጧል! 🎉\n\nትዕዛዝዎ ወደ ህትመት ገብቷል።\n📦 የሚደርስበት ጊዜ: ${duration}\n\nዮናስ ሞባይልን ስለመረጡ እናመሰግናለን! 🙌`
          : userProfiles[targetUserId] &&
              userProfiles[targetUserId].lang === "or"
            ? `🎉 Kaffaltiin mirkanaa'eera! 🎉\n\nAjajni keessan maxxansamutti jira.\n📦 Yeroo itti gahu: ${duration}\n\nYonas Mobile filachuu keessaniif galatoomaa! 🙌`
            : `🎉 Payment Successful! 🎉\n\nYour custom case is officially in production.\n📦 Estimated Delivery: ${duration}\n\nThank you for choosing Yonas Mobile! 🙌`;

      bot.sendMessage(targetUserId, finalReceipt);
      bot.sendMessage(
        chatId,
        `✅ Order fully completed! Delivery duration sent to User ${targetUserId}.`,
      );

      if (superAdminId) {
        const profile = userProfiles[targetUserId];
        const superAlert = `👑 SUPER ADMIN ALERT 👑\n\n✅ Order Successfully Completed & Payment Verified!\n\n👤 User: ${profile.name}\n📞 Phone: ${profile.phone}\n📍 Location: ${profile.location}\n📦 Estimated Delivery: ${duration}\n👨‍💻 Handled by Admin ID: ${chatId}`;
        bot.sendMessage(superAdminId, superAlert);
      }

      delete adminState[chatId];
      delete userState[targetUserId];

      setTimeout(() => {
        showMainMenu(targetUserId);
      }, 2000);
      return;
    }
  }

  if (!userState[chatId] || !userState[chatId].step) return;

  const step = userState[chatId].step;
  const returnToCheckout = userState[chatId].returnToCheckout;
  const userName = msg.from.username
    ? `@${msg.from.username}`
    : msg.from.first_name;

  if (step === "awaiting_name") {
    userProfiles[chatId].name = text;
    userState[chatId].step = "awaiting_phone";
    return bot.sendMessage(chatId, t(chatId, "ask_phone"));
  }
  if (step === "awaiting_phone") {
    userProfiles[chatId].phone = text;
    userState[chatId].step = "awaiting_location";
    return bot.sendMessage(chatId, t(chatId, "ask_location"));
  }
  if (step === "awaiting_location") {
    userProfiles[chatId].location = text;
    userState[chatId].step = null;

    bot.sendMessage(chatId, t(chatId, "profile_updated"));

    if (returnToCheckout) return showCheckoutConfirmation(chatId);
    else return showMainMenu(chatId);
  }

  if (step === "awaiting_chat_message") {
    const adminChatAlert = `💬 NEW MESSAGE FROM USER 💬\n👤 User: ${userName}\n🆔 ID: ${chatId}\n\n📝 Message:\n"${text}"`;
    const adminKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "💬 Reply back", callback_data: `reply_${chatId}` }],
        ],
      },
    };

    notifyAdmins(adminChatAlert, adminKeyboard);
    bot.sendMessage(chatId, t(chatId, "msg_sent"));
    delete userState[chatId];
  }
});

bot.on("polling_error", (error) => console.error(`[Error] ${error.message}`));
console.log("✅ Bot is up and running! Multi-Admin & Super Admin active...");
