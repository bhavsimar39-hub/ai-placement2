/// frontend/js/job-match.js — Expanded with 16 domains, 4+ roles each

const jobData = {
    "machine-learning": {
        title: "Machine Learning / AI",
        accent: "linear-gradient(90deg,#0ef5cb,#06b6d4)",
        jobs: [
            { role:"Machine Learning Engineer", badge:{text:"🔥 Hot",cls:"badge-hot"}, salary:"₹8–22 LPA", demand:92, companies:["Google","Amazon","Nvidia","OpenAI","Microsoft"], skills:["Python","TensorFlow","PyTorch","MLOps","Docker","Kubernetes"], description:"Build and deploy production ML models powering intelligent products at scale. Design training pipelines and optimize inference for millions of users.", scope:"ML roles growing 40% YoY — most in-demand engineering specialization." },
            { role:"AI Researcher", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹10–35 LPA", demand:78, companies:["DeepMind","Meta AI","Microsoft Research","Anthropic"], skills:["Python","Deep Learning","Linear Algebra","NLP","Computer Vision","Research Writing"], description:"Push the boundaries of what AI can achieve. Design novel architectures and publish research that shapes the next decade of intelligence.", scope:"Top-tier role — frontier labs hire globally with exceptional compensation." },
            { role:"NLP Engineer", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹9–24 LPA", demand:88, companies:["Google","Amazon Alexa","IBM Watson","Sarvam AI","Krutrim"], skills:["Python","HuggingFace","BERT","LLMs","Transformers","Fine-tuning"], description:"Make computers understand human language. Build chatbots, summarizers, translators and the next generation of AI assistants.", scope:"LLM boom has tripled NLP job postings — hottest AI sub-field right now." },
            { role:"Computer Vision Engineer", badge:{text:"🔥 Hot",cls:"badge-hot"}, salary:"₹10–28 LPA", demand:85, companies:["Tesla","Qualcomm","Intel","Samsung","Ola Electric"], skills:["OpenCV","YOLO","PyTorch","CNNs","Image Segmentation","Edge AI"], description:"Teach machines to see and interpret the visual world. From autonomous vehicles to medical imaging — your code replaces human eyes.", scope:"Autonomous vehicles and medical AI are driving explosive demand for vision engineers." }
        ]
    },
    "web-development": {
        title: "Web Development",
        accent: "linear-gradient(90deg,#6366F1,#06B6D4)",
        jobs: [
            { role:"Full Stack Developer", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹5–18 LPA", demand:95, companies:["TCS","Infosys","Swiggy","Flipkart","Razorpay"], skills:["React","Node.js","TypeScript","PostgreSQL","Docker","AWS"], description:"Own features end-to-end — pixel-perfect UIs to bulletproof APIs serving millions daily.", scope:"Most in-demand role in India — consistently highest hiring volume." },
            { role:"Frontend Developer", badge:{text:"✅ Stable",cls:"badge-green"}, salary:"₹4–14 LPA", demand:88, companies:["Google","Zomato","CRED","Meesho","Paytm"], skills:["JavaScript","React","Next.js","CSS/Tailwind","Web Performance","Accessibility"], description:"Craft exceptional user experiences. Translate designs into blazing-fast, accessible interfaces used by millions.", scope:"Every product company needs frontend talent — zero saturation." },
            { role:"Backend Developer", badge:{text:"✅ Stable",cls:"badge-green"}, salary:"₹5–16 LPA", demand:91, companies:["Zepto","Dunzo","Ola","Nykaa","PolicyBazaar"], skills:["Node.js","Go","Java/Spring","PostgreSQL","Redis","Microservices"], description:"Build the engines that power web applications. Design robust APIs, databases and services that never go down.", scope:"Backend is the backbone of every app — perennial high demand across all sectors." },
            { role:"Web Performance Engineer", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹8–20 LPA", demand:76, companies:["Cloudflare","Akamai","Google","Netflix","Hotstar"], skills:["Core Web Vitals","CDN","Webpack","Browser APIs","Profiling","Edge Computing"], description:"Make the web faster. Obsessively optimize load times, runtime performance and user experience at a global scale.", scope:"Performance is now a Google ranking factor — specialized role with excellent pay." }
        ]
    },
    "app-development": {
        title: "Mobile App Development",
        accent: "linear-gradient(90deg,#f472b6,#6366F1)",
        jobs: [
            { role:"Android Developer", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹4–15 LPA", demand:85, companies:["Samsung","Paytm","PhonePe","Meesho","ShareChat"], skills:["Kotlin","Jetpack Compose","Android Studio","Firebase","REST APIs","Room DB"], description:"Build native Android experiences for India's 700M smartphone users.", scope:"India's Android market is world's largest — huge sustained demand." },
            { role:"iOS Developer", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹6–20 LPA", demand:74, companies:["Apple","Uber","CRED","Groww","Nykaa"], skills:["Swift","SwiftUI","Xcode","Core Data","ARKit","App Store Connect"], description:"Craft premium apps for Apple's ecosystem. iOS users spend 2x more — premium skill, premium salary.", scope:"Undersupply of iOS developers keeps salaries consistently high." },
            { role:"Flutter Developer", badge:{text:"🔥 Hot",cls:"badge-hot"}, salary:"₹5–18 LPA", demand:89, companies:["Google","BookMyShow","Cars24","Rapido","Slice"], skills:["Flutter","Dart","Firebase","BLoC/Riverpod","REST APIs","CI/CD"], description:"Build one codebase that runs beautifully on Android, iOS, web and desktop. The most efficient cross-platform solution.", scope:"Flutter adoption growing 60% YoY — companies love one team covering all platforms." },
            { role:"React Native Developer", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹5–17 LPA", demand:83, companies:["Shopify","Meta","Microsoft","Swiggy","Urban Company"], skills:["React Native","JavaScript","TypeScript","Redux","Native Modules","Expo"], description:"Leverage web skills to build mobile apps. Large JavaScript ecosystem makes this the most accessible mobile framework.", scope:"JavaScript developers can transition easily — massive demand from startups." }
        ]
    },
    "cybersecurity": {
        title: "Cybersecurity",
        accent: "linear-gradient(90deg,#f87171,#f472b6)",
        jobs: [
            { role:"Security Analyst (SOC)", badge:{text:"🔥 Hot",cls:"badge-hot"}, salary:"₹6–16 LPA", demand:89, companies:["Deloitte","KPMG","IBM Security","Cisco","Palo Alto Networks"], skills:["SIEM","Splunk","Incident Response","Networking","Linux","Threat Intelligence"], description:"Monitor, detect and respond to cyber threats in real time from the Security Operations Center.", scope:"3.5M unfilled cybersecurity jobs globally — zero saturation." },
            { role:"Ethical Hacker / Pentester", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹8–30 LPA", demand:82, companies:["BugCrowd","HackerOne","Synack","Rapid7","Independent"], skills:["BurpSuite","Metasploit","Python","OSINT","Web App Security","Active Directory"], description:"Get paid to break systems. Find critical vulnerabilities before attackers do and earn massive bug bounties.", scope:"Top bug hunters earn $500k+/year — globally remote and extremely well paid." },
            { role:"Cloud Security Engineer", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹10–25 LPA", demand:91, companies:["AWS Security","Microsoft","Google","Palo Alto Networks","CrowdStrike"], skills:["AWS/Azure Security","IAM","Zero Trust","CSPM","Terraform","Compliance"], description:"Secure cloud infrastructure for companies hosting petabytes of sensitive data across global regions.", scope:"Cloud-first world needs cloud security specialists — highest growth sub-field." },
            { role:"Malware Analyst / Reverse Engineer", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹12–35 LPA", demand:72, companies:["Kaspersky","McAfee","CERT-In","DRDO","National Cyber Agency"], skills:["Assembly","IDA Pro","Ghidra","Python","Debugging","Binary Analysis"], description:"Dissect malicious software to understand how attacks work and build defenses against them.", scope:"Rarest and highest paid security skill — government and defense agencies pay premium." }
        ]
    },
    "cloud": {
        title: "Cloud Engineering",
        accent: "linear-gradient(90deg,#3b82f6,#0ef5cb)",
        jobs: [
            { role:"Cloud Engineer", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹7–22 LPA", demand:91, companies:["AWS","Google Cloud","Azure","Accenture","Wipro"], skills:["AWS/GCP/Azure","Terraform","Linux","Networking","Python","Kubernetes"], description:"Design resilient, auto-scaling infrastructure handling petabytes of data across global regions.", scope:"Cloud market growing 25% YoY — every company migrating from on-premise." },
            { role:"DevOps / Platform Engineer", badge:{text:"🔥 Hot",cls:"badge-hot"}, salary:"₹6–20 LPA", demand:93, companies:["Netflix","RedHat","HashiCorp","Atlassian","Thoughtworks"], skills:["Docker","Kubernetes","CI/CD","Ansible","Prometheus","GitOps"], description:"Bridge dev and ops. Build automated pipelines that deploy thousands of times daily with zero downtime.", scope:"Highest ROI engineering skill — companies save millions with great DevOps culture." },
            { role:"Site Reliability Engineer", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹12–30 LPA", demand:86, companies:["Google","Uber","LinkedIn","Flipkart","Hotstar"], skills:["SRE Principles","Kubernetes","Go/Python","Observability","Chaos Engineering","On-call"], description:"Maintain 99.99% uptime for systems used by hundreds of millions. Error budgets, SLOs and blameless postmortems.", scope:"Google invented SRE — now every large tech company needs them at premium salaries." },
            { role:"Cloud Architect", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹18–45 LPA", demand:79, companies:["TCS","Infosys","Cognizant","IBM","Capgemini"], skills:["Multi-cloud","Solution Architecture","Cost Optimization","Security","Migration","Well-Architected Framework"], description:"Design the blueprint for enterprise cloud transformation. Balance performance, cost and security at organizational scale.", scope:"Senior architects command the highest salaries in IT — shortage of 50k+ architects in India." }
        ]
    },
    "data-science": {
        title: "Data Science & Analytics",
        accent: "linear-gradient(90deg,#fbbf24,#f87171)",
        jobs: [
            { role:"Data Scientist", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹10–28 LPA", demand:87, companies:["IBM","Accenture","Fractal Analytics","McKinsey","Amazon"], skills:["Python","R","Statistics","ML","SQL","Tableau","A/B Testing"], description:"Turn raw data into strategic decisions. Build predictive models, uncover patterns and present findings to C-suite.", scope:"Top-3 highest paying tech job globally — demand outstrips supply by 2:1." },
            { role:"Data Analyst", badge:{text:"✅ Stable",cls:"badge-green"}, salary:"₹4–12 LPA", demand:94, companies:["Deloitte","KPMG","PwC","EY","Naukri"], skills:["SQL","Excel","Power BI","Python","Statistics","Dashboard Design"], description:"Transform spreadsheets into crystal-clear business insights that drive strategy and revenue.", scope:"Every company needs data talent — perfect entry role with clear growth path." },
            { role:"Data Engineer", badge:{text:"🔥 Hot",cls:"badge-hot"}, salary:"₹8–22 LPA", demand:90, companies:["Airbnb","Uber","Flipkart","PhonePe","Freshworks"], skills:["Apache Spark","Kafka","Airflow","SQL","Python","Snowflake","dbt"], description:"Build the highways data travels on. Design pipelines processing billions of events that data scientists depend on.", scope:"Data engineering has overtaken data science in job volume — foundational and irreplaceable." },
            { role:"Business Intelligence Developer", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹6–16 LPA", demand:83, companies:["SAP","Oracle","Salesforce","MakeMyTrip","IndiaMart"], skills:["Power BI","Tableau","SQL","SSAS","Data Modeling","ETL"], description:"Build dashboards and reports that executives use daily. Connect business questions to data answers in real time.", scope:"Every enterprise investing in data culture needs BI developers to democratize insights." }
        ]
    },
    "ui-ux": {
        title: "UI/UX Design",
        accent: "linear-gradient(90deg,#f472b6,#fbbf24)",
        jobs: [
            { role:"UI/UX Designer", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹4–16 LPA", demand:83, companies:["Adobe","Swiggy","Byju's","Razorpay","Dunzo"], skills:["Figma","Prototyping","User Research","Design Systems","Accessibility","Framer"], description:"Shape how millions interact with technology. Great design makes or breaks a product — you define the user's emotional journey.", scope:"Startups and MNCs investing heavily — product sense is the new superpower." },
            { role:"Product Designer", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹6–22 LPA", demand:79, companies:["Google","Microsoft","Atlassian","Notion","Linear"], skills:["Design Thinking","Systems Design","Wireframing","Data Analysis","Leadership","Storytelling"], description:"Own the complete product experience from vision to pixel at the intersection of business, users and technology.", scope:"AI tools elevate good designers, not replace them — most future-proof creative role." },
            { role:"UX Researcher", badge:{text:"✅ Stable",cls:"badge-green"}, salary:"₹5–14 LPA", demand:74, companies:["Google","Meta","Amazon","Dream11","MindTree"], skills:["User Interviews","Usability Testing","Survey Design","Figma","Data Analysis","Personas"], description:"Be the voice of the user in product decisions. Your research prevents million-dollar mistakes before launch.", scope:"Companies that invest in research ship better products — growing recognition of this role." },
            { role:"Motion & Interaction Designer", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹6–20 LPA", demand:76, companies:["Apple","Google","Hotstar","Dream11","Lottie Files"], skills:["After Effects","Lottie","Rive","Principle","CSS Animation","Framer Motion"], description:"Design the micro-interactions and animations that make apps feel magical. From loading states to complex transitions.", scope:"Top-tier apps differentiate on motion quality — niche skill with premium pay." }
        ]
    },
    "digital-marketing": {
        title: "Digital Marketing",
        accent: "linear-gradient(90deg,#34d399,#3b82f6)",
        jobs: [
            { role:"SEO / Growth Specialist", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹3–10 LPA", demand:80, companies:["HubSpot","Naukri","Zomato","Semrush","Neil Patel Digital"], skills:["SEO","Content Strategy","Ahrefs","Technical SEO","Analytics","CRO"], description:"Drive millions of organic visitors through smart keyword strategy and technical optimization.", scope:"Every business with a website needs SEO — recession-proof sustained demand." },
            { role:"Performance Marketing Manager", badge:{text:"🔥 Hot",cls:"badge-hot"}, salary:"₹5–15 LPA", demand:86, companies:["Meesho","Nykaa","Swiggy","Razorpay","CRED"], skills:["Google Ads","Meta Ads","Analytics","A/B Testing","Attribution","Budget Management"], description:"Manage crores of ad spend across Google and Meta to drive measurable ROI for fast-growing brands.", scope:"Performance marketing directly impacts revenue — among highest-valued marketing skills." },
            { role:"Content Strategist", badge:{text:"✅ Stable",cls:"badge-green"}, salary:"₹4–12 LPA", demand:77, companies:["HubSpot","Freshworks","Zoho","WebEngage","MoEngage"], skills:["Content Writing","SEO","CMS","Analytics","Brand Voice","Storytelling"], description:"Build content ecosystems that educate, engage and convert at every stage of the customer journey.", scope:"Content is the foundation of every digital strategy — evergreen demand." },
            { role:"Social Media Manager", badge:{text:"✅ Stable",cls:"badge-green"}, salary:"₹3–12 LPA", demand:76, companies:["Mamaearth","Sugar Cosmetics","boAt","Noise","WOW Skin Science"], skills:["Content Creation","Brand Strategy","Video Editing","Community Management","Paid Social","Analytics"], description:"Build brand communities and drive viral growth for products millions of people love.", scope:"India's creator economy booming — social has evolved into high-impact career." }
        ]
    },
    "blockchain": {
        title: "Blockchain & Web3",
        accent: "linear-gradient(90deg,#a78bfa,#f472b6)",
        jobs: [
            { role:"Blockchain Developer", badge:{text:"🔥 Hot",cls:"badge-hot"}, salary:"₹10–35 LPA", demand:84, companies:["Polygon","Coinbase","WazirX","CoinDCX","Consensys"], skills:["Solidity","Ethereum","Smart Contracts","Web3.js","Hardhat","IPFS"], description:"Build decentralized applications and smart contracts that run without intermediaries on public blockchains.", scope:"Web3 market at $3T+ — developers earn some of tech's highest salaries." },
            { role:"Smart Contract Auditor", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹15–50 LPA", demand:71, companies:["Trail of Bits","OpenZeppelin","Certik","Halborn","Code4rena"], skills:["Solidity","Security Analysis","Formal Verification","Slither","Foundry","EVM Internals"], description:"Find vulnerabilities in smart contracts before hackers drain millions in crypto. The most critical security role in Web3.", scope:"One audit report can earn ₹5–50L — rarest and highest paid blockchain role." },
            { role:"Web3 Frontend Developer", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹8–25 LPA", demand:79, companies:["Uniswap","OpenSea","Mirror","Lens Protocol","Unstoppable Domains"], skills:["React","ethers.js","Wagmi","WalletConnect","TypeScript","IPFS"], description:"Build decentralized frontends that connect users to blockchain protocols. Wallet integrations, token displays and DeFi dashboards.", scope:"Every protocol needs a beautiful interface — Web3 frontend is underserved and well-paid." },
            { role:"DeFi Protocol Engineer", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹18–60 LPA", demand:68, companies:["Aave","Compound","Uniswap","Curve","Yearn Finance"], skills:["Solidity","DeFi Mechanics","Mathematical Finance","Cryptography","Foundry","Economic Modeling"], description:"Build the financial primitives of the decentralized web — lending protocols, AMMs and yield strategies.", scope:"DeFi protocols manage billions in TVL — engineers here are among highest paid in all of tech." }
        ]
    },
    "game-development": {
        title: "Game Development",
        accent: "linear-gradient(90deg,#fbbf24,#f472b6)",
        jobs: [
            { role:"Unity Developer", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹4–16 LPA", demand:81, companies:["Dream11","Mobile Premier League","Nazara","Octro","99Games"], skills:["Unity","C#","Physics","AR/VR","Shader Programming","Performance Optimization"], description:"Build immersive games and interactive experiences used by hundreds of millions. India's gaming industry is exploding.", scope:"India gaming market projected to reach $8.6B by 2027 — massive talent shortage." },
            { role:"Unreal Engine Developer", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹8–25 LPA", demand:74, companies:["Epic Games","EA","Ubisoft","nCore Games","GamesForge"], skills:["Unreal Engine","C++","Blueprints","VFX","Level Design","Rendering"], description:"Craft photorealistic games and virtual worlds using the most powerful real-time 3D engine on the planet.", scope:"Unreal is expanding beyond games into film, architecture and metaverse — enormous future." },
            { role:"Game Designer", badge:{text:"✅ Stable",cls:"badge-green"}, salary:"₹4–14 LPA", demand:72, companies:["Zynga","Scopely","Loco","WinZO","PlaySimple"], skills:["Game Mechanics","Level Design","UX for Games","Monetization","Analytics","Balancing"], description:"Design the systems, rules and progression that make games addictive and rewarding. Pure creativity meets psychology.", scope:"Mobile gaming generates billions — talented designers who understand engagement loops are invaluable." },
            { role:"AR/VR Developer", badge:{text:"🔥 Hot",cls:"badge-hot"}, salary:"₹8–22 LPA", demand:83, companies:["Meta","Apple Vision","Snap","Niantic","Samsung XR"], skills:["Unity/Unreal","ARKit/ARCore","WebXR","Spatial Computing","3D Math","Shaders"], description:"Build the interfaces of tomorrow — spatial computing experiences on phones, headsets and glasses.", scope:"Apple Vision Pro launch signaled mainstream AR — this decade's platform shift." }
        ]
    },
    "devrel": {
        title: "DevRel & Developer Advocacy",
        accent: "linear-gradient(90deg,#34d399,#6366F1)",
        jobs: [
            { role:"Developer Advocate", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹8–22 LPA", demand:77, companies:["Google","Microsoft","HashiCorp","Postman","Twilio"], skills:["Public Speaking","Technical Writing","APIs","Community Building","Demo Building","Video Production"], description:"Bridge the gap between product teams and the developer community. Build trust, write content and advocate for both sides.", scope:"Every developer tool company is hiring advocates — unique role for technical communicators." },
            { role:"Technical Writer", badge:{text:"✅ Stable",cls:"badge-green"}, salary:"₹5–16 LPA", demand:79, companies:["Google","Stripe","MongoDB","Atlassian","Freshworks"], skills:["Technical Writing","APIs","Markdown","Docs-as-Code","Diagramming","Developer UX"], description:"Make complex technology accessible. Write the docs, guides and tutorials that help millions of developers succeed.", scope:"Good documentation is worth millions in saved support costs — writers are chronically undersupplied." },
            { role:"Community Manager (Dev)", badge:{text:"✅ Stable",cls:"badge-green"}, salary:"₹4–12 LPA", demand:72, companies:["GitHub","StackOverflow","Hasura","Supabase","PlanetScale"], skills:["Community Building","Discord/Slack","Event Management","Content","Empathy","Analytics"], description:"Grow and nurture developer communities that become the company's biggest competitive advantage.", scope:"Developer-led growth is the most efficient GTM — community managers are critical to this motion." },
            { role:"Solutions Engineer", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹10–25 LPA", demand:80, companies:["Salesforce","Twilio","Stripe","Razorpay","Chargebee"], skills:["Full Stack Development","APIs","Sales Engineering","Presentation","SQL","Integration"], description:"Be the technical hero in sales deals. Build demos, prove value and architect solutions that close enterprise contracts.", scope:"Technical plus business skills command premium — highest non-engineering compensation in tech." }
        ]
    },
    "embedded": {
        title: "Embedded Systems & IoT",
        accent: "linear-gradient(90deg,#f87171,#fbbf24)",
        jobs: [
            { role:"Embedded Systems Engineer", badge:{text:"🔥 Hot",cls:"badge-hot"}, salary:"₹5–18 LPA", demand:83, companies:["Bosch","Continental","Qualcomm","MediaTek","ISRO"], skills:["C/C++","RTOS","ARM Cortex","Device Drivers","PCB Design","UART/SPI/I2C"], description:"Program the silicon that controls cars, medical devices and industrial machinery. Code that literally touches hardware.", scope:"Every physical product becoming smart — firmware engineers are the most under-supplied in all of tech." },
            { role:"IoT Solutions Architect", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹8–22 LPA", demand:85, companies:["AWS IoT","Azure IoT","Siemens","Honeywell","Tata Elxsi"], skills:["MQTT","AWS IoT","Edge Computing","Python","Networking","Cloud Integration"], description:"Design end-to-end IoT systems from sensors to dashboards. Connect billions of physical devices to the cloud.", scope:"IoT market hitting $1T by 2030 — architects who can bridge hardware and cloud are essential." },
            { role:"VLSI / Chip Design Engineer", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹8–30 LPA", demand:78, companies:["Intel","AMD","Qualcomm","Samsung Semiconductor","NVIDIA"], skills:["Verilog/VHDL","SystemVerilog","UVM","Synthesis","DFT","SPICE"], description:"Design the chips that power every device on earth. India's semiconductor mission creating thousands of high-value roles.", scope:"India's $10B semiconductor incentive scheme creating massive talent demand now." },
            { role:"Robotics Software Engineer", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹8–25 LPA", demand:80, companies:["Boston Dynamics","Ola Electric","Addverb","Grey Orange","Siemens"], skills:["ROS/ROS2","C++","Python","Computer Vision","SLAM","Motion Planning"], description:"Program robots that navigate warehouses, assist surgeries and explore planets. The most interdisciplinary engineering role.", scope:"Automation wave hitting every industry — robotics software engineers at the center of it." }
        ]
    },
    "quantitative": {
        title: "Quantitative Finance & FinTech",
        accent: "linear-gradient(90deg,#0ef5cb,#6366F1)",
        jobs: [
            { role:"Quantitative Analyst (Quant)", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹15–60 LPA", demand:72, companies:["Goldman Sachs","JP Morgan","Citadel","Two Sigma","Quantinsti"], skills:["Python","R","Statistics","Probability","Derivatives","Stochastic Calculus"], description:"Build mathematical models that make financial predictions worth billions. The intersection of mathematics, statistics and finance.", scope:"Quants are among the highest paid professionals in the world — extreme scarcity of talent." },
            { role:"Algorithmic Trading Engineer", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹12–45 LPA", demand:70, companies:["Zerodha","Upstox","IIFL","WorldQuant","AlphaGrep"], skills:["Python/C++","Low Latency","Market Microstructure","Backtesting","Risk Management","Fix Protocol"], description:"Build trading systems that execute thousands of orders per second based on quantitative signals.", scope:"India's stock market booming — algo trading firms paying top dollar for engineering talent." },
            { role:"FinTech Product Engineer", badge:{text:"🔥 Hot",cls:"badge-hot"}, salary:"₹8–22 LPA", demand:88, companies:["Razorpay","Zepto","PhonePe","CRED","Jupiter Bank"], skills:["Java/Go","Payment APIs","PCI DSS","System Design","High Availability","Distributed Systems"], description:"Build financial infrastructure — payment gateways, lending engines and banking systems used by 500M+ Indians.", scope:"India's fintech is the world's most vibrant — engineers here build for scale no other country matches." },
            { role:"Risk & Compliance Analyst", badge:{text:"✅ Stable",cls:"badge-green"}, salary:"₹6–16 LPA", demand:81, companies:["RBI-regulated NBFCs","HDFC","Axis Bank","Bajaj Finance","KreditBee"], skills:["Risk Modeling","SQL","Python","Regulatory Frameworks","Credit Analysis","Statistics"], description:"Protect financial institutions from credit, market and operational risk. Critical role as digital lending explodes.", scope:"RBI's digital lending guidelines creating massive compliance hiring across all FinTech companies." }
        ]
    },
    "product-management": {
        title: "Product Management",
        accent: "linear-gradient(90deg,#fbbf24,#34d399)",
        jobs: [
            { role:"Product Manager", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹10–28 LPA", demand:85, companies:["Google","Microsoft","Swiggy","Razorpay","Groww"], skills:["Roadmapping","PRDs","Data Analysis","SQL","A/B Testing","Stakeholder Management"], description:"Be the CEO of your product. Translate user pain into features, prioritize ruthlessly and ship products millions love.", scope:"PM is the most coveted role in tech — career ceiling is literally CEO." },
            { role:"Technical Product Manager", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹14–35 LPA", demand:82, companies:["AWS","Stripe","Atlassian","Freshworks","Postman"], skills:["APIs","System Design","SQL","Engineering Background","Product Metrics","Developer Experience"], description:"Bridge business goals and engineering execution. Build developer tools, APIs and infrastructure products at scale.", scope:"TPMs command 30-40% premium over general PMs — technical depth is the differentiator." },
            { role:"Growth Product Manager", badge:{text:"🔥 Hot",cls:"badge-hot"}, salary:"₹12–30 LPA", demand:83, companies:["Hotstar","Meesho","ShareChat","Ola","Lenskart"], skills:["Growth Loops","Experimentation","Funnel Analysis","SQL","Behavioral Psychology","Retention"], description:"Run experiments that compound growth. Every feature you ship is a hypothesis — you live by the data.", scope:"Growth PM is the most impact-heavy role in consumer products — drives the metrics that attract funding." },
            { role:"AI Product Manager", badge:{text:"🔥 Hot",cls:"badge-hot"}, salary:"₹15–40 LPA", demand:88, companies:["OpenAI","Google","Microsoft Copilot","Sarvam AI","Krutrim"], skills:["LLMs","Product Sense","Prompt Engineering","Ethics","Data Analysis","Roadmapping"], description:"Define what AI products should do and how they should behave. The newest and hottest PM specialization.", scope:"Every company building AI products needs PMs who understand both AI and users — acute scarcity." }
        ]
    },
    "arvr": {
        title: "AR / VR & Spatial Computing",
        accent: "linear-gradient(90deg,#a78bfa,#0ef5cb)",
        jobs: [
            { role:"XR Developer (Unity/Unreal)", badge:{text:"🔥 Hot",cls:"badge-hot"}, salary:"₹8–24 LPA", demand:82, companies:["Meta","Apple","Snap","Qualcomm XR","Lenovo"], skills:["Unity/Unreal","C#/C++","OpenXR","Spatial UI","3D Mathematics","Performance Optimization"], description:"Build immersive experiences for headsets, phones and glasses. You're creating the next computing platform.", scope:"Apple Vision Pro marks the start of the spatial computing era — first movers will dominate." },
            { role:"3D Technical Artist", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹5–16 LPA", demand:76, companies:["EA","Ubisoft","WPP XR","Accenture Song","Publicis Sapient"], skills:["Blender","Substance Painter","Shaders","LOD Optimization","Rigging","PBR Workflow"], description:"Create the digital assets and visual systems that make virtual worlds believable and performant.", scope:"Every industry moving into 3D — from retail to real estate, demand for 3D artists exploding." },
            { role:"Spatial UX Designer", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹10–28 LPA", demand:71, companies:["Apple","Meta","Samsung XR","Niantic","Microsoft HoloLens"], skills:["Spatial UI","Hand Tracking","Eye Gaze","Depth Perception","Accessibility","Figma XR"], description:"Design interfaces that exist in three-dimensional space. Invent new interaction paradigms without the constraints of flat screens.", scope:"One of the rarest design skills — Apple Vision Pro created instant demand for spatial UX expertise." },
            { role:"WebXR Developer", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹7–20 LPA", demand:75, companies:["Mozilla","A-Frame","8th Wall","Niantic Lightship","Shopify AR"], skills:["Three.js","WebXR API","React Three Fiber","GLSL","WASM","Progressive Enhancement"], description:"Bring AR/VR experiences to the browser — no app install required. Reach billions instantly through a URL.", scope:"WebXR removes the install barrier — the most accessible way to deploy immersive experiences." }
        ]
    },
    "mlops": {
        title: "MLOps & AI Infrastructure",
        accent: "linear-gradient(90deg,#06b6d4,#a78bfa)",
        jobs: [
            { role:"MLOps Engineer", badge:{text:"🔥 Hot",cls:"badge-hot"}, salary:"₹10–28 LPA", demand:91, companies:["Google","Meta AI","Amazon","Databricks","Weights & Biases"], skills:["MLflow","Kubeflow","Docker","Kubernetes","Python","Feature Stores","Model Registry"], description:"Bridge data science and production. Build the CI/CD pipelines, monitoring and infrastructure that take ML models from notebook to billions of predictions.", scope:"Every company with ML needs MLOps — the plumbing that makes AI actually work in production." },
            { role:"AI Infrastructure Engineer", badge:{text:"💎 Premium",cls:"badge-premium"}, salary:"₹14–40 LPA", demand:86, companies:["NVIDIA","Google DeepMind","Meta FAIR","Microsoft Azure AI","Together AI"], skills:["CUDA","Distributed Training","GPU Clusters","PyTorch Distributed","Triton","HPC"], description:"Build the computational backbone that trains frontier AI models. Work with thousand-GPU clusters and PB-scale datasets.", scope:"Training GPT-4-scale models requires specialized infra engineers — rarest and most compensated AI role." },
            { role:"Data Platform Engineer", badge:{text:"📈 Trending",cls:"badge-trending"}, salary:"₹8–22 LPA", demand:88, companies:["Databricks","Snowflake","dbt Labs","Airbnb","Uber"], skills:["Apache Spark","Flink","Kafka","dbt","Lakehouse Architecture","Data Governance"], description:"Build the data lake and streaming infrastructure that feeds every analytics and ML workload in the organization.", scope:"Data platform is the new competitive advantage — every data-driven company investing heavily." },
            { role:"LLM Engineer", badge:{text:"🔥 Hot",cls:"badge-hot"}, salary:"₹12–35 LPA", demand:95, companies:["OpenAI","Anthropic","Cohere","AI21 Labs","Sarvam AI"], skills:["LLMs","RAG","Fine-tuning","LangChain","Vector DBs","Prompt Engineering","RLHF"], description:"Build production systems powered by large language models. RAG pipelines, fine-tuned models and agentic workflows.", scope:"LLM Engineering is the hottest role in all of tech right now — demand exceeding supply by 10:1." }
        ]
    }
};

let currentInterest = null;

function selectInterest(el) {
    document.querySelectorAll('.interest-pill').forEach(p => p.classList.remove('active'));
    el.classList.add('active');
    currentInterest = el.dataset.val;
    showJobs(currentInterest);
}

function showJobs(interest) {
    const container = document.getElementById("jobResults");
    const data = jobData[interest];
    if (!data) { container.innerHTML = ""; return; }

    // ── Save to localStorage for dashboard ───────────────
    const topJob = data.jobs.sort((a,b) => b.demand - a.demand)[0];
    localStorage.setItem("job_match_count", data.jobs.length);
    localStorage.setItem("top_job_role",    topJob ? topJob.role : "");
    // Count total matches across all domains explored
    const allDomains = Object.values(jobData);
    const totalRoles = allDomains.reduce((sum, d) => sum + d.jobs.length, 0);
    localStorage.setItem("job_match_total", totalRoles);

    container.innerHTML = `
        <div class="results-bar">
            <div class="rb-left">
                <div class="rb-category">${data.title}</div>
                <div class="rb-badge">${data.jobs.length} roles found</div>
            </div>
            <div class="rb-right">
                <button class="rb-filter on" onclick="sortJobs('demand',this)">⬆ Demand</button>
                <button class="rb-filter" onclick="sortJobs('salary',this)">💰 Salary</button>
            </div>
        </div>
        <div class="jobs-grid" id="jobsGrid"></div>
    `;
    renderCards(data.jobs, data.accent);
}

function renderCards(jobs, accent) {
    const grid = document.getElementById("jobsGrid");
    if (!grid) return;
    grid.innerHTML = jobs.map((job) => `
        <div class="job-card" style="--card-accent:${accent}">
            <div class="jc-top">
                <div class="jc-toprow">
                    <div class="jc-title-wrap">
                        <div class="jc-role">${job.role}</div>
                        <div class="jc-company-row">
                            ${job.companies.slice(0,3).map(c=>`<span class="jc-co-tag">🏢 ${c}</span>`).join('')}
                            ${job.companies.length>3?`<span class="jc-co-tag">+${job.companies.length-3}</span>`:''}
                        </div>
                    </div>
                    <span class="jc-badge ${job.badge.cls}">${job.badge.text}</span>
                </div>
                <div class="jc-meta">
                    <div class="jc-meta-item"><span class="jc-salary">${job.salary}</span></div>
                    <div class="jc-meta-item"><svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>India / Remote</div>
                    <div class="jc-meta-item"><svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5z" clip-rule="evenodd"/></svg>Full-time</div>
                </div>
            </div>
            <div class="jc-body">
                <p class="jc-desc">${job.description}</p>
                <div class="jc-demand">
                    <div class="jc-demand-header"><span class="jc-demand-label">Market Demand</span><span class="jc-demand-pct">${job.demand}%</span></div>
                    <div class="jc-bar-track"><div class="jc-bar-fill" data-width="${job.demand}%"></div></div>
                </div>
                <div class="jc-skills-title">Required Skills</div>
                <div class="jc-skills">${job.skills.map(s=>`<span class="jc-skill">${s}</span>`).join('')}</div>
            </div>
            <div class="jc-footer">
                <div class="jc-scope">${job.scope}</div>
                <button class="apply-btn" onclick="saveRole(this,'${job.role.replace(/'/g,"\\'")}')">
                    Explore Role
                    <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>
                </button>
            </div>
        </div>`).join('');

    requestAnimationFrame(() => {
        document.querySelectorAll('.jc-bar-fill').forEach((bar, i) => {
            setTimeout(() => { bar.style.width = bar.dataset.width; }, 150 + i * 80);
        });
    });
}

function sortJobs(by, btn) {
    if (!currentInterest) return;
    document.querySelectorAll('.rb-filter').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    const jobs = [...jobData[currentInterest].jobs];
    if (by === 'demand') {
        jobs.sort((a,b) => b.demand - a.demand);
    } else {
        jobs.sort((a,b) => {
            const max = s => parseInt(s.match(/(\d+)\s*LPA/g)?.pop() || '0');
            return max(b.salary) - max(a.salary);
        });
    }
    renderCards(jobs, jobData[currentInterest].accent);
}


const ROADMAPS = {
    "Machine Learning Engineer":  ["1. Master Python (NumPy, Pandas, Matplotlib)","2. Learn Statistics & Linear Algebra fundamentals","3. Study ML algorithms (Scikit-learn courses)","4. Deep Learning with TensorFlow or PyTorch","5. Build 3 end-to-end ML projects","6. Learn MLOps basics (Docker, model serving)","7. Contribute to open-source ML projects"],
    "AI Researcher":              ["1. Strong foundation in advanced Mathematics","2. Deep Learning fundamentals (fast.ai, DeepLearning.ai)","3. Read and implement research papers","4. Pick a specialization (NLP, CV, RL)","5. Reproduce SOTA papers with improvements","6. Publish on arXiv or workshop papers","7. Apply to top labs / PhD programs"],
    "NLP Engineer":               ["1. Python + basic ML fundamentals","2. Text processing (NLTK, spaCy)","3. Transformers and HuggingFace ecosystem","4. Fine-tune BERT, GPT models on custom data","5. Build LLM-powered applications (RAG, agents)","6. Deploy NLP APIs at production scale"],
    "Computer Vision Engineer":   ["1. Python + OpenCV basics","2. Deep Learning (CNNs from scratch)","3. Object detection (YOLO, RCNN)","4. Image segmentation and tracking","5. Edge deployment (TensorRT, ONNX)","6. Build portfolio: face recognition, defect detection"],
    "Full Stack Developer":       ["1. HTML, CSS, JavaScript fundamentals","2. React.js + TypeScript for frontend","3. Node.js + Express for backend APIs","4. PostgreSQL / MongoDB databases","5. Docker + basic AWS deployment","6. Build 2 full-stack projects end-to-end"],
    "Frontend Developer":         ["1. HTML5, CSS3, vanilla JavaScript mastery","2. React.js with hooks and state management","3. Next.js for SSR and performance","4. Tailwind CSS + responsive design","5. Web performance (Core Web Vitals, Lighthouse)","6. Deploy on Vercel — build portfolio"],
    "Backend Developer":          ["1. Pick a language: Node.js / Go / Java","2. REST APIs + authentication (JWT, OAuth)","3. Databases: SQL (PostgreSQL) + NoSQL","4. Caching with Redis","5. Microservices and message queues","6. System design fundamentals"],
    "LLM Engineer":               ["1. Python + Transformers (HuggingFace)","2. Prompt engineering techniques","3. Build RAG systems (LangChain / LlamaIndex)","4. Fine-tuning with LoRA / QLoRA","5. Vector databases (Pinecone, Weaviate)","6. Deploy LLM APIs with FastAPI + Docker"],
    "default":                    ["1. Build strong fundamentals in the core language/tools","2. Complete 1–2 structured online courses","3. Build 3 portfolio projects solving real problems","4. Contribute to open source or freelance","5. Network on LinkedIn — reach out to practitioners","6. Apply for internships or entry-level roles"],
};

function getRoadmap(role) {
    return ROADMAPS[role] || ROADMAPS["default"];
}

function saveRole(btn, role) {
    if (!currentInterest) return;
    const data = jobData[currentInterest];
    const job  = data.jobs.find(j => j.role === role);
    if (!job) return;

    // Save explored role to localStorage for dashboard
    localStorage.setItem("top_job_role",   job.role);
    localStorage.setItem("top_job_salary", job.salary);
    localStorage.setItem("top_job_score",  job.demand);

    openRoleModal(job, data.accent);
}

function openRoleModal(job, accent) {
    localStorage.setItem("targetRole", job.role);
    document.getElementById("roleModal").style.display = "flex";
    document.getElementById("modalAccent").style.background = accent;
    document.getElementById("modalTitle").textContent   = job.role;
    document.getElementById("modalSalary").textContent  = "💰 " + job.salary + "  ·  📍 India / Remote";
    document.getElementById("modalDesc").textContent    = job.description;
    document.getElementById("modalDemandPct").textContent = job.demand + "%";
    document.getElementById("modalScope").textContent   = job.scope;

    document.getElementById("modalBadge").innerHTML =
        `<span class="jc-badge ${job.badge.cls}">${job.badge.text}</span>`;

    document.getElementById("modalCompanies").innerHTML =
        job.companies.map(c => `<span style="display:inline-flex;align-items:center;gap:5px;padding:5px 12px;border-radius:20px;background:#151e2d;border:1px solid rgba(255,255,255,.07);font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(232,237,245,.7);">🏢 ${c}</span>`).join('');

    document.getElementById("modalSkills").innerHTML =
        job.skills.map(s => `<span style="padding:5px 12px;border-radius:7px;background:#151e2d;border:1px solid rgba(255,255,255,.08);font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:600;color:rgba(232,237,245,.6);">${s}</span>`).join('');

    const roadmap = getRoadmap(job.role);
    document.getElementById("modalRoadmap").innerHTML = roadmap.map((step,i) => `
        <div style="display:flex;gap:12px;padding:11px 14px;background:#151e2d;border-radius:10px;border:1px solid rgba(255,255,255,.06);border-left:3px solid #0ef5cb;animation:fadeUp .3s ease ${i*0.05}s both;">
            <span style="font-family:'JetBrains Mono',monospace;font-size:11px;color:rgba(232,237,245,.7);line-height:1.6;">${step}</span>
        </div>`).join('');

    // Animate demand bar
    setTimeout(() => {
        document.getElementById("modalDemandBar").style.width = job.demand + "%";
    }, 200);
}

function closeRoleModal() {
    document.getElementById("roleModal").style.display = "none";
    document.getElementById("modalDemandBar").style.width = "0%";
}

function closeModal(e) {
    if (e.target === document.getElementById("roleModal")) closeRoleModal();
}

function searchJobs() {
    const role = localStorage.getItem("targetRole") || "Software Engineer";
    const url  = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(role)}&location=India`;
    window.open(url, "_blank");
}
// ═══════════════════════════════════════════════════════════
//  PERSONALISED MATCH  —  BERT + Groq AI integration
// ═══════════════════════════════════════════════════════════

/* ── Auto-run personalised match on page load ─────────────── */
document.addEventListener('DOMContentLoaded', () => {
    // Skills may come from resume upload (skills_found) or skill-gap page
    const stored = localStorage.getItem('skills_found') || localStorage.getItem('skills_matched');
    if (!stored) return;
    try {
        const skills = JSON.parse(stored);
        if (Array.isArray(skills) && skills.length > 0) {
            runPersonalisedMatch(skills);
        }
    } catch (_) {}
});

/* ── Call backend and render AI-enhanced match ─────────────── */
async function runPersonalisedMatch(skills) {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Show loading state in personalised section
    const section = document.getElementById('personalisedSection');
    if (!section) return;
    section.style.display = 'block';
    section.innerHTML = `
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:20px;padding:28px 32px;
                    position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;right:0;height:2px;
                        background:linear-gradient(90deg,#10B981,#6366F1,#06B6D4);"></div>
            <div style="display:flex;align-items:center;gap:12px;color:#6B7280;font-size:14px;">
                <div style="width:20px;height:20px;border:2px solid #10B981;border-top-color:transparent;
                            border-radius:50%;animation:spin 0.8s linear infinite;"></div>
                Analysing your ${skills.length} skills with AI…
            </div>
        </div>`;

    try {
        const res = await fetch(API_BASE + '/match/match', {
            method: 'POST',
            headers: {
                'Content-Type':  'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ skills }),
        });

        if (!res.ok) { section.style.display = 'none'; return; }
        const data = await res.json();
        if (!data.success) { section.style.display = 'none'; return; }

        renderPersonalisedMatch(data, skills);
    } catch (_) {
        section.style.display = 'none';
    }
}

/* ── Render complete AI match panel ─────────────────────────── */
function renderPersonalisedMatch(data, skills) {
    const section = document.getElementById('personalisedSection');
    if (!section) return;

    const { summary, topMatches = [], nlpInsights, bertUsed, semanticBoosts = [] } = data;
    const top6 = topMatches.slice(0, 6);

    // Grade colours
    const gradeStyle = {
        "Strong Match": { bg: 'rgba(16,185,129,0.1)',  color: '#059669',  border: 'rgba(16,185,129,0.25)' },
        "Good Match":   { bg: 'rgba(99,102,241,0.1)',  color: '#6366F1',  border: 'rgba(99,102,241,0.25)' },
        "Partial Match":{ bg: 'rgba(245,158,11,0.1)',  color: '#D97706',  border: 'rgba(245,158,11,0.25)' },
        "Skill Gap":    { bg: 'rgba(239,68,68,0.1)',   color: '#DC2626',  border: 'rgba(239,68,68,0.25)'  },
    };

    // ── Top 6 Match Cards (3-column grid, 2 rows) ──────────
    const cardsHTML = top6.map((job, i) => {
        const gs        = gradeStyle[job.grade] || gradeStyle["Partial Match"];
        const bertJob   = semanticBoosts.find(b => b.role === job.role);
        const bertBadge = bertJob
            ? `<span style="background:rgba(124,58,237,0.1);color:#7C3AED;border:1px solid rgba(124,58,237,0.2);
                            padding:2px 6px;border-radius:8px;font-size:9px;font-weight:700;">🧠 BERT</span>` : '';

        const rankColors = ['linear-gradient(135deg,#10B981,#059669)','linear-gradient(135deg,#6366F1,#4F46E5)','linear-gradient(135deg,#F59E0B,#D97706)','linear-gradient(135deg,#06B6D4,#0891B2)','linear-gradient(135deg,#EC4899,#DB2777)','linear-gradient(135deg,#8B5CF6,#7C3AED)'];
        const rankLabel  = i === 0 ? '🏆 #1 Best Match' : `#${i+1}`;

        return `
        <div style="background:white;border:1px solid #E5E7EB;border-radius:14px;padding:16px 18px;
                    position:relative;transition:box-shadow .2s;display:flex;flex-direction:column;gap:10px;"
             onmouseenter="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.1)'"
             onmouseleave="this.style.boxShadow='none'">

            <!-- Rank strip + grade -->
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                <span style="background:${rankColors[i]};color:white;padding:3px 10px;border-radius:8px;
                             font-size:10px;font-weight:700;white-space:nowrap;">${rankLabel}</span>
                <div style="display:flex;gap:4px;align-items:center;">
                    <span style="background:${gs.bg};border:1px solid ${gs.border};color:${gs.color};
                                 padding:2px 8px;border-radius:8px;font-size:10px;font-weight:700;">${job.grade}</span>
                    ${bertBadge}
                </div>
            </div>

            <!-- Role name + salary -->
            <div>
                <div style="font-weight:800;font-size:14px;color:#111827;margin-bottom:3px;line-height:1.3;">
                    ${job.role}</div>
                <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#10B981;font-weight:600;">
                    ${job.salary}</div>
            </div>

            <!-- Score bar -->
            <div>
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                    <span style="font-size:11px;color:#6B7280;">Match Score</span>
                    <span style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:800;
                                 color:${gs.color};">${job.matchScore}%</span>
                </div>
                <div style="height:5px;background:#F3F4F6;border-radius:3px;overflow:hidden;">
                    <div style="height:100%;width:${job.matchScore}%;background:${rankColors[i]};
                                border-radius:3px;transition:width 1s ease;"></div>
                </div>
            </div>

            <!-- Skills -->
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
                ${(job.matchedSkills || []).slice(0,3).map(s =>
                    `<span style="background:rgba(16,185,129,0.1);color:#059669;border:1px solid rgba(16,185,129,0.2);
                                  padding:2px 7px;border-radius:5px;font-size:10px;font-weight:600;">✓ ${s}</span>`
                ).join('')}
                ${(job.missingSkills || []).slice(0,2).map(s =>
                    `<span style="background:rgba(239,68,68,0.06);color:#DC2626;border:1px solid rgba(239,68,68,0.12);
                                  padding:2px 7px;border-radius:5px;font-size:10px;font-weight:600;">✗ ${s}</span>`
                ).join('')}
            </div>
        </div>`;
    }).join('');

    // ── Groq NLP Insights ──────────────────────────────────
    let nlpHTML = '';
    if (nlpInsights) {
        const gapCards = (nlpInsights.criticalGaps || []).map(g => `
            <div style="background:white;border:1px solid #FED7AA;border-radius:10px;
                        padding:12px 14px;display:flex;align-items:flex-start;gap:10px;">
                <div style="background:linear-gradient(135deg,#F59E0B,#D97706);color:white;border-radius:7px;
                            width:24px;height:24px;display:flex;align-items:center;justify-content:center;
                            font-size:11px;font-weight:800;flex-shrink:0;">⚡</div>
                <div>
                    <div style="font-weight:700;font-size:13px;color:#111827;">
                        ${g.skill}
                        <span style="background:#FEF3C7;color:#D97706;padding:2px 7px;border-radius:8px;
                                     font-size:10px;margin-left:5px;">~${g.estimatedWeeks}w</span>
                        <span style="background:#DBEAFE;color:#2563EB;padding:2px 7px;border-radius:8px;
                                     font-size:10px;margin-left:3px;">+${g.impactedRoles} roles</span>
                    </div>
                </div>
            </div>`).join('');

        const strengthPills = (nlpInsights.skillStrengths || []).map(s =>
            `<span style="background:rgba(16,185,129,0.1);color:#059669;border:1px solid rgba(16,185,129,0.2);
                          padding:5px 12px;border-radius:20px;font-size:12px;font-weight:600;">✓ ${s}</span>`
        ).join('');

        nlpHTML = `
        <div style="margin-top:20px;background:linear-gradient(135deg,#F0FDF4,#EFF6FF);
                    border:1px solid #A7F3D0;border-radius:16px;padding:22px 24px;position:relative;overflow:hidden;">
            <div style="position:absolute;top:0;left:0;right:0;height:2px;
                        background:linear-gradient(90deg,#10B981,#6366F1,#06B6D4);"></div>

            <!-- Header -->
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
                <div style="font-size:20px;">🤖</div>
                <div>
                    <div style="font-weight:800;font-size:15px;color:#064E3B;">AI Career Analysis</div>
                    <div style="font-size:11px;color:#059669;">Powered by Groq · LLaMA 3.3 70B</div>
                </div>
                <div style="margin-left:auto;background:linear-gradient(135deg,#10B981,#059669);color:white;
                            padding:3px 12px;border-radius:20px;font-size:11px;font-weight:700;">Personalised</div>
            </div>

            ${nlpInsights.headline ? `
            <div style="font-size:17px;font-weight:800;color:#064E3B;margin-bottom:8px;letter-spacing:-.3px;">
                ${nlpInsights.headline}</div>` : ''}

            ${nlpInsights.profileSummary ? `
            <div style="font-size:13px;color:#374151;line-height:1.65;padding:12px 14px;background:white;
                        border-radius:10px;border:1px solid #A7F3D0;margin-bottom:16px;">
                ${nlpInsights.profileSummary}</div>` : ''}

            <!-- Best Fit Role -->
            ${nlpInsights.bestFitRole ? `
            <div style="background:white;border:1px solid #C7D2FE;border-radius:12px;padding:14px 16px;margin-bottom:16px;">
                <div style="font-size:11px;font-weight:700;color:#4338CA;text-transform:uppercase;
                            letter-spacing:1px;margin-bottom:8px;">🎯 Best Fit Role</div>
                <div style="font-weight:800;font-size:15px;color:#111827;margin-bottom:4px;">
                    ${nlpInsights.bestFitRole.role}
                    <span style="background:rgba(99,102,241,0.1);color:#6366F1;border:1px solid rgba(99,102,241,0.2);
                                 padding:2px 8px;border-radius:8px;font-size:11px;margin-left:8px;">
                        ${nlpInsights.bestFitRole.readinessLevel}</span>
                </div>
                <div style="font-size:12px;color:#6B7280;margin-bottom:8px;line-height:1.5;">
                    ${nlpInsights.bestFitRole.why}</div>
                <div style="font-family:'JetBrains Mono',monospace;font-size:12px;color:#10B981;font-weight:700;">
                    💰 ${nlpInsights.bestFitRole.salaryExpectation}</div>
            </div>` : ''}

            <!-- Skill Strengths -->
            ${strengthPills ? `
            <div style="margin-bottom:16px;">
                <div style="font-size:11px;font-weight:700;color:#065F46;text-transform:uppercase;
                            letter-spacing:1px;margin-bottom:8px;">💪 Your Strengths</div>
                <div style="display:flex;flex-wrap:wrap;gap:7px;">${strengthPills}</div>
            </div>` : ''}

            <!-- Critical Gaps -->
            ${gapCards ? `
            <div style="margin-bottom:16px;">
                <div style="font-size:11px;font-weight:700;color:#92400E;text-transform:uppercase;
                            letter-spacing:1px;margin-bottom:8px;">⚡ Skills That Unlock More Roles</div>
                <div style="display:flex;flex-direction:column;gap:7px;">${gapCards}</div>
            </div>` : ''}

            <!-- Bottom row: market insight + week-one action -->
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:${nlpInsights.hiddenOpportunity?'12px':'0'};">
                ${nlpInsights.marketOpportunity ? `
                <div style="background:rgba(37,99,235,0.06);border:1px solid rgba(37,99,235,0.15);
                            border-radius:10px;padding:12px;">
                    <div style="font-size:10px;font-weight:700;color:#1D4ED8;text-transform:uppercase;
                                letter-spacing:1px;margin-bottom:4px;">📈 Market Reality</div>
                    <div style="font-size:12px;color:#374151;line-height:1.5;">${nlpInsights.marketOpportunity}</div>
                </div>` : ''}
                ${nlpInsights.weekOneAction ? `
                <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.18);
                            border-radius:10px;padding:12px;">
                    <div style="font-size:10px;font-weight:700;color:#065F46;text-transform:uppercase;
                                letter-spacing:1px;margin-bottom:4px;">⚡ This Week</div>
                    <div style="font-size:12px;color:#374151;font-weight:600;line-height:1.5;">
                        ${nlpInsights.weekOneAction}</div>
                </div>` : ''}
            </div>

            <!-- Hidden opportunity -->
            ${nlpInsights.hiddenOpportunity ? `
            <div style="background:rgba(124,58,237,0.06);border:1px solid rgba(124,58,237,0.15);
                        border-radius:10px;padding:12px;">
                <div style="font-size:10px;font-weight:700;color:#5B21B6;text-transform:uppercase;
                            letter-spacing:1px;margin-bottom:4px;">💡 Hidden Opportunity</div>
                <div style="font-size:12px;color:#374151;line-height:1.5;">${nlpInsights.hiddenOpportunity}</div>
            </div>` : ''}
        </div>`;
    }

    // ── BERT badge ─────────────────────────────────────────
    const bertBadge = bertUsed ? `
        <div style="display:flex;align-items:center;gap:6px;background:rgba(124,58,237,0.08);
                    border:1px solid rgba(124,58,237,0.2);border-radius:20px;padding:4px 12px;">
            <span style="font-size:12px;">🧠</span>
            <span style="font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;color:#7C3AED;">
                BERT semantic boost applied</span>
        </div>` : '';

    // ── Assemble full panel ─────────────────────────────────
    section.innerHTML = `
        <div style="background:#fff;border:1px solid #E5E7EB;border-radius:20px;padding:28px 32px;
                    position:relative;overflow:hidden;margin-bottom:28px;">
            <div style="position:absolute;top:0;left:0;right:0;height:2px;
                        background:linear-gradient(90deg,#10B981,#6366F1,#06B6D4);"></div>

            <!-- Header row -->
            <div style="display:flex;align-items:center;justify-content:space-between;
                        flex-wrap:wrap;gap:12px;margin-bottom:20px;">
                <div>
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
                        <div style="width:8px;height:8px;border-radius:50%;background:#10B981;
                                    box-shadow:0 0 10px #10B981;"></div>
                        <span style="font-family:'JetBrains Mono',monospace;font-size:10px;color:#10B981;
                                     text-transform:uppercase;letter-spacing:2px;">Your Personalised Match</span>
                    </div>
                    <div style="font-size:20px;font-weight:800;letter-spacing:-.5px;color:#111827;">
                        AI-Matched Roles for Your Skills</div>
                    <div style="font-size:13px;color:#6B7280;margin-top:4px;">
                        Based on <strong>${skills.length} skills</strong> · 
                        <strong>${summary.totalMatches}</strong> roles matched · 
                        Top score <strong>${summary.topScore}%</strong>
                    </div>
                </div>
                <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                    ${bertBadge}
                    <button onclick="runPersonalisedMatch(${JSON.stringify(skills)})"
                            style="padding:8px 16px;border-radius:10px;border:1px solid #E5E7EB;
                                   background:transparent;font-size:12px;font-weight:600;
                                   color:#6B7280;cursor:pointer;">↻ Refresh</button>
                </div>
            </div>

            <!-- Top 6 match cards: 3-column grid, 2 rows -->
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:0;">
                ${cardsHTML}
            </div>

            ${nlpHTML}
        </div>`;

    // ── Auto-select best matching domain → removes empty state ──
    // Find the domain of the top result and activate that pill
    const bestDomain = topMatches[0]?.domain;
    if (bestDomain) {
        const pill = document.querySelector(`.interest-pill[data-val="${bestDomain}"]`);
        if (pill) {
            // Use a small delay so the panel renders first
            setTimeout(() => selectInterest(pill), 300);
        }
    }

    // Hide the manual skill input row — no longer needed
    const entryRow = document.getElementById('skillEntryRow');
    if (entryRow) entryRow.style.display = 'none';
}