// Blog data — migrated verbatim from portfolio-v13 (src/lib/data.ts).
// Local image paths are rewritten to hotlink the old repo's public/ assets.
export type ContentBlock =
  | string
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; code: string }
  | { type: "image"; src: string; alt: string }
  | { type: "mermaid"; code: string };

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  date: string;
  blurb: string;
  readTime: string;
  tags: string[];
  content: ContentBlock[];
  sourceUrl: string;
}

const RAW_BASE =
  "https://raw.githubusercontent.com/paramcodes/portfolio-v13/main/public";

const fixSrc = (src: string) => (src.startsWith("/") ? RAW_BASE + src : src);

const fixContent = (blocks: ContentBlock[]): ContentBlock[] =>
  blocks.map((b) => {
    if (typeof b === "string") return b;
    if (b.type === "image") return { ...b, src: fixSrc(b.src) };
    return b;
  });

const _POSTS: BlogPost[] = [
  {
    id: "b4",
    slug: "building-discharge-summary-agent",
    title: "Building Discharge Summary Agent",
    date: "06.2026",
    blurb:
      "In this article, I am going to explain how I made the discharge summary agent.",
    readTime: "5 min read",
    tags: ["Agentic RAG", "LLM", "AI", "Machine Learning", "Python"],
    content: [
      {
        type: "heading",
        text: "Problem statement",
      },
      "We are given a patient's folder containing different kinds of PDF data related to the course of actions during their admission in the hospital. We need to summarize it and tell what actually changed after the patient was discharged.",
      {
        type: "heading",
        text: "Why even need an agent for this?",
      },
      "You might be thinking: why do we need an agent? We can just give it to any LLM and it will do it, right? No. There are lots of problems here. First, LLMs do not understand the structure by themselves. Data may be lab reports, tables, handwritten notes, and more. An LLM could hallucinate or mix things up, so we need to provide very refined information and let it reason in a controlled fashion.",
      {
        type: "subheading",
        text: "Safety Principles",
      },
      "We need to make sure our agent follows these rules. The data will pass through the agent and reach the LLM as a refined version.",
      {
        type: "list",
        items: [
          "never guess",
          "never fabricate (never create anything by self)",
          "unknown > wrong",
          "if data is not available, say not available",
          "conflicts: flag, do not decide",
          "provenance for every fact (the source of truth must exist)",
        ],
      },
      {
        type: "image",
        src: "https://miro.medium.com/v2/resize:fit:1400/1*ZVYyFzC_ZaOa3pPpuofIrg.png",
        alt: "Safety principles for the discharge summary agent",
      },
      {
        type: "heading",
        text: "Ingestion",
      },
      "Our agent takes the PDF and extracts structured text from it. We start by dividing the pages and storing their text one by one where possible; otherwise, we flag the page for OCR extraction.",
      {
        type: "code",
        code: "{\n  page_number,\n  text,\n  has_text,\n  ocr_applied\n}",
      },
      "Data in the folder could be of two types: digitally typed documents and handwritten notes.",
      {
        type: "heading",
        text: "Evidence Extraction",
      },
      "After ingestion, we have an array containing long strings of text. We pass those strings to the LLM to generate an initial structured state. Gemini, or another model, can process one page at a time or in batches and return the following JSON format.",
      {
        type: "code",
        code: "{\n  \"diagnoses\": [{ \"fact\": \"...\", \"source_text\": \"...\" }],\n  \"medications\": [{ \"name\": \"...\", \"dosage\": \"...\", \"frequency\": \"...\", \"route\": \"...\", \"status\": \"...\", \"source_text\": \"...\" }],\n  \"allergies\": [{ \"fact\": \"...\", \"source_text\": \"...\" }],\n  \"procedures\": [{ \"fact\": \"...\", \"source_text\": \"...\" }],\n  \"pending_results\": [{ \"fact\": \"...\", \"source_text\": \"...\" }]\n}",
      },
      {
        type: "code",
        code: "You are an expert clinical data extractor prioritizing safety over completeness. Unknown > Wrong. Never fabricate, never infer, never guess.\n\nExtract diagnoses, medications (with dosage, frequency, route, and status), allergies, procedures, and pending results. For each entity, extract the exact source_text snippet that proves it. If a field or category is missing, use Not Documented. Respond strictly in the requested JSON format.",
      },
      "We take the output and push it to our state variable, then aggregate the states by grouping related information together. If page 4 says diabetes and page 15 says hypertension, we do not decide prematurely which one to keep. We collect and bundle the facts without reasoning too early, while tracking conflicts, review flags, missing fields, trace logs, and the agent-loop step count.",
      {
        type: "code",
        code: "{\n  \"patient_info\": {},\n  \"diagnoses\": [],\n  \"procedures\": [],\n  \"medications\": { \"admission\": [], \"discharge\": [] },\n  \"allergies\": [],\n  \"follow_up\": [],\n  \"pending_results\": [],\n  \"hospital_course\": [],\n  \"conflicts\": [],\n  \"missing_fields\": [],\n  \"flags_for_review\": [],\n  \"evidence\": [],\n  \"trace\": [],\n  \"step_count\": 0\n}",
      },
      {
        type: "heading",
        text: "Agent Loop",
      },
      "After we have our initial state, we start our loop. It runs for a finite number of steps or until the complete state is validated.",
      {
        type: "subheading",
        text: "Reconciliation",
      },
      "We check what changed during admission and after discharge, including medication changes. If we find a change that is not justified, such as medication being added or stopped, we store it in the state for review.",
      {
        type: "subheading",
        text: "Conflict Detection",
      },
      "If we find conflicts, such as multiple diagnoses, we flag them for review and escalate instead of deciding on our own.",
      {
        type: "subheading",
        text: "Validate",
      },
      "If fields are missing or a source does not exist, we mark them for review.",
      {
        type: "heading",
        text: "LLM",
      },
      "Finally, we pass the validated state to the LLM and let it generate the output with these guardrails.",
      {
        type: "code",
        code: "You are an expert clinical documentation assistant.\nWrite a clear, structured Markdown Discharge Summary based ONLY on the provided clinical evidence.\n\nCRITICAL RULES:\n- NEVER infer, guess, or fabricate clinical information.\n- If a field or category is missing or empty, explicitly state Not Documented.\n- Organize into standard clinical headings: Diagnoses, Medications, Allergies, Procedures, Pending Results.\n- Do not invent patient names, dates, or hospital locations unless they are strictly provided in the text.\n\nProvided Evidence:\n{state_text}",
      },
      {
        type: "heading",
        text: "Architecture Design",
      },
      {
        type: "image",
        src: "https://miro.medium.com/v2/resize:fit:1400/1*vclJucgngVmrjebzAgcTZg.png",
        alt: "Architecture design for the discharge summary agent",
      },
      "Implementation: https://github.com/paramcodes/junior-doctor",
    ],
    sourceUrl:
      "https://pub.towardsai.net/building-discharge-summary-agent-d98e65ba1c1f",
  },
  {
    id: "b5",
    slug: "what-happens-bts-git-add-git-commit",
    title: "what happens bts when you git add and git commit",
    date: "09.2025",
    blurb:
      "A look inside Git's content-addressable object store: blobs, trees, commits, staging, and history.",
    readTime: "6 min read",
    tags: ["Git", "Developer Tools", "System Design"],
    content: [
      {
        type: "image",
        src: "https://pbs.twimg.com/media/HLJSSvdbcAA0RqT.jpg",
        alt: "Git internals article cover",
      },
      "Git is an content-addressable filesystem which means it store the data in key-value pair, we can store literally anything in the git repo and it will give back to us a key corresponding to that content. for git everything is an object. we can store any content in the form of either blob, tree or object.",
      {
        type: "heading",
        text: "Blob, tree and commit",
      },
      "let's first talk about blob so it's an data type which contains only data of the file and not the filename or nothing.",
      "then there is tree data type it stores either the reference to blob or other tree, so basically we can use this for folders.",
      "now commit, it stores the snapshots( different versions of our files), it can store either reference to some tree, parent commit, author and the message.",
      "so we must have heard many a times that git is an version control system which is indeed true we can basically jump from one version of file / folder / project to another version whenever we wants.",
      {
        type: "heading",
        text: "Initialising the repository",
      },
      "so let's talk about it more",
      "so we initiates a git repo by",
      {
        type: "code",
        code: "git init",
      },
      "it will initialise a git repo. in the current directory or we can put the folder name after init with space which will initialize the repo in that folder or create new one if that doesn't exist.",
      "now when you run that command it creates a hidden directory .git which has a folder object where all of our hash objects and everything is stored.",
      {
        type: "heading",
        text: "Writing objects",
      },
      "now you might be thinking how do we hash it, so there is command for that like down below you can are not passing any file but text itself, --stdin tells that take the content from terminal itself, we are not providing any file as of now, -w tells it to write the key to the object store and not simply return it.",
      {
        type: "code",
        code: "echo 'hello' | git hash-object -w --stdin",
      },
      "running this command will return us with 40-character checksum hash(SHA-1 hash), which will store the content of ours in that objects folder we talked earlier in which it will take first 2 chars and use that for folder name and other as file. we can inspect the content of that hash via git cat-file command like following, -p tells to figure out the type of content, blog or tree or commit",
      {
        type: "code",
        code: "git cat-file -p <object-hash>\ngit cat-file -t <object-hash>",
      },
      "we can also check the object type changing the -p to -t like following",
      "again, say we wanna put the content of some file now, say hello.txt, then",
      {
        type: "code",
        code: "git hash-object -w hello.txt",
      },
      "rest remains the same.",
      {
        type: "heading",
        text: "Trees and the staging area",
      },
      "now let's talk about trees, it helps us in storing file names and directories/folders.",
      "we can store the tree in the following fashion",
      "here you can see main branch is referencing to many blob and even another tree as well.",
      "it would look like this visually,",
      "so now question is how do we create a tree? git create a tree by taking the state of our staging area or index, so we need to do that first. we can do that by using update-index command.",
      {
        type: "code",
        code: "git update-index --add --cacheinfo 100644 <blob-hash> test.txt\ngit write-tree",
      },
      "--cacheinfo tell that take the file from database(object store), --add to put the files in the staging area or create the stage first if not there any yet. 100644 is one of 3 modes, you can google about that.",
      "now our test.txt would be add to stage. now we can create the tree using following command. and our tree with this blob and filename will be created.",
      "now suppose we made some change in the file and wanna stage that than simply we can using the eariler command but without --add as it's already in the staging area right?",
      {
        type: "heading",
        text: "Commits and history",
      },
      "now let's talk bit about commit, it's fairly simple",
      "we can just use git commit-tree command for this",
      {
        type: "code",
        code: "echo 'first commit' | git commit-tree <tree-hash>",
      },
      "and we can inspect that using the same we have been using since ages now. cat-file.",
      "you can notice the author name and mail id which we configure during git setup.",
      "similarly we can keep on commiting to add different version like this. you can see we are using first 7 chars of the hash value for reference.",
      "third is pointing to second and second is pointing to first commit.",
      "then we can git log and would look around like this.",
      "finally it would look like this visually.",
      "Thanks for reading.",
      "references: Git internals",
    ],
    sourceUrl: "https://x.com/i/article/2067779462582972416",
  },
  {
    id: "b6",
    slug: "agent-console-realtime-ai-chat-system-design",
    title: "Agent Console - realtime ai chat system design",
    date: "06.2026",
    blurb:
      "Designing a resilient realtime AI chat frontend for streaming responses, tool calls, replay, and unreliable networks.",
    readTime: "8 min read",
    tags: ["System Design", "WebSockets", "AI Agents", "Frontend"],
    content: [
      {
        type: "image",
        src: "https://pbs.twimg.com/media/HLO2lJgagAA6rs3.jpg",
        alt: "Agent Console realtime AI chat system design cover",
      },
      {
        type: "heading",
        text: "What we are gonna build",
      },
      "The backend (agent-server) is provided as a Docker container. You do not modify it. It speaks a documented WebSocket protocol, simulates a context-aware AI agent that streams responses, makes tool calls, retrieves context, and when chaos mode is enabled drops connections, reorders messages, injects latency spikes, and sends malformed heartbeats. Your job is to build a frontend that handles all of it gracefully.",
      {
        type: "heading",
        text: "Problem Understanding",
      },
      "How does a simple chat application looks like?",
      {
        type: "image",
        src: "https://pbs.twimg.com/media/HLO249WaUAAzzjH.png",
        alt: "Simple chat application flow",
      },
      "But things don't go as it seems, many a times we face",
      {
        type: "list",
        items: [
          "Network failures, reconnection, duplicate responses, replay, tool calls, partial responses, etc.",
        ],
      },
      "Suppose, server sends 1 2 3 4 5 but network delivers 1 3 4 2 5, like network is not bound to deliver in the manner it receives from server right? if we process these events as it then we won't understand anything, we would want that things happen in a sequence right? so we would design a system which handles this case.",
      "we won't receive the string but a json in a format {seq,type,value}={1,TOKEN,Hello}, now seq becomes our go to way which we can use to order things and process them correctly.",
      "now let's understand few things.",
      {
        type: "heading",
        text: "Events",
      },
      "now instead of just getting string we would consider everything as events like",
      {
        type: "code",
        code: "MESSAGE_START\nTOKEN\nTOOL_CALL\nTOOL_RESULT\nMESSAGE_END",
      },
      "and this whole message would be a complete message instead of just string.",
      {
        type: "heading",
        text: "Event Streams",
      },
      "collection of many events and we will be using this as source of truth.",
      {
        type: "heading",
        text: "Reorder Buffer",
      },
      "We uses this when events don't come in order like server send 1 2 3 but network give us 1 3 2 so while we won't get 2 we would put the 3 in the buffer and process 2 first then pick it from buffer and process, basically it is used like storage.",
      {
        type: "heading",
        text: "Protocol Engine Design",
      },
      "Now, let's design the protocol engine, responsible for protocol corectness means getting the events properly and storing it so that later on can be used to create the initial state.",
      {
        type: "list",
        items: [
          "it would be responsible for ordering, deduplication, replay, resume, buffering.",
          "StatenextExpectedSeq\nBuffer\nprocessed",
        ],
      },
      "Now let's talk about problems and how we are gonna solve it one - by - one",
      {
        type: "heading",
        text: "Deduplication",
      },
      "Suppose we were receiving event 1 2 3 and connection drops then how would backend know what to send next? it won't right? we would handle that here itself and let it send duplicates like maybe when connection re-establishes it send us 2 3 4, so for those 2 3 we would just ignore them like we would check is upcoming event sequence is equal to nextexpectedseq, is its greater we would push that to buffer, if it's smaller then we would ignore that completely and if it's equal then ofcourse we would process it.",
      {
        type: "heading",
        text: "Idempotency",
      },
      "It means that applying the same operation multiple times would give us same result. like if you process the same numbers again and again should give same result.",
      {
        type: "heading",
        text: "Replay",
      },
      "We have already discuss about it indirectly when server sends the same events then what would we do? ignore them simply.",
      {
        type: "heading",
        text: "Resume",
      },
      "Now, there's a catch like when the connection drops then what should we do? from where it should resume like what should be the nextexpectedseq now? is it the highestreceived or highestprocessed? ofcourse highestprocessed right, suppose there is different between two and we start asking from highestprocessed then everything would start piling up in buffer and it won't process ever.",
      {
        type: "heading",
        text: "State Reconstruction and Event Sourcing",
      },
      "Suppose we turned off the computer and logged in again then would be ask the server for everything again for same query? no we would store that right? so we would store the events somewhere and would reconstruct the state using those, this is also known as replay.",
      "So that was it for protocol engine, now everything is processed and stored.",
      {
        type: "heading",
        text: "ChatStateBuilder",
      },
      "Now, the ChatState can be build using the ordered events we have stored in the processed. using any loop easily. then we can easily render that in UI.",
      {
        type: "subheading",
        text: "Now, Message Storage in state",
      },
      "We can either store the message as string, which won't be of much detail, or as parts with toolcalls and results and everything. we should store the toolresults in the toolcalls itself so that it's easy for referencing like what toolcall this result even belongs to.",
      {
        type: "image",
        src: "https://pbs.twimg.com/media/HLO4H2GbkAAzNLG.jpg",
        alt: "Chat message storage design",
      },
      {
        type: "heading",
        text: "ACKs",
      },
      "one of thing is acknowledgment like once we received the the message we can say the server we got it. but then server would say yeah, i got it that you got it then client would again say that it got it that you got it so we won't do things like this, we would follow idempotency, do it once and forgets about it, doesn't matters much.",
      {
        type: "heading",
        text: "State Machines",
      },
      "How we are gonna store the state like connecting, resume and all? we can use bolleans but that would create problem like it may be connecting and resuming both or streaming which would lead to confusion instead of this we can use fintite state machines like conversation state = idle or whatever and connection state = disconnect or so.",
      {
        type: "heading",
        text: "Snapshots",
      },
      "Suppose we have millions of events coming to our way. so how are gonna replay all of them again? do we process everything at once? no right our system would hang, our ram consumption would explode, so instead we would batch it and would process it in parts like we would only process what we needed as you might have seen in chatgpt too. it keeps the latest one while the oldest ones when you tries to visit it takes some time to load usually.",
      {
        type: "heading",
        text: "Final Architecture",
      },
      {
        type: "image",
        src: "https://pbs.twimg.com/media/HLO4OuxakAARWwV.jpg",
        alt: "Agent Console final architecture diagram",
      },
      {
        type: "image",
        src: "https://pbs.twimg.com/media/HLO4TuQaMAA-YqP.jpg",
        alt: "Agent Console implementation architecture",
      },
      "Implementation: Agent Console",
      "Thanks for Reading",
    ],
    sourceUrl: "https://x.com/Your_PARAM/status/2068200594809196911",
  },
  {
    id: "b7",
    slug: "system-design-book-summary",
    title: "System Design Book Summary",
    date: "2026",
    blurb:
      "How to build a system that can scale from zero to millions of users without breaking down completely.",
    readTime: "7 min read",
    tags: ["System Design", "Scalability", "Architecture"],
    content: [
      "This blog is the summary of system design book by bytebytego, we would explore how to build a system that can scale from zero to millions of users without breaking down completely.",
      {
        type: "heading",
        text: "Setting a Single Server",
      },
      "Climbing a peak starts with taking your first step. So just getting started with a yanky system is the best we can do. We would be running everything on a single server from web app, database, cache or whatever as given below.",
      {
        type: "image",
        src: "/systemdesign/singleserversystemdesign.png",
        alt: "Single-server system design",
      },
      {
        type: "subheading",
        text: "Request Flow",
      },
      {
        type: "list",
        items: [
          "Users access the websites, via browser or mobile apps, using domain names like google.com which are paid and given by DNS providers.",
          "When we enters the domain address, request is sent to DNS providers and corresponding IP address is returned back to the browser.",
          "Now, HTTP requests are sent using IP address directly with web server which returns HTML or JSON response for rendering.",
        ],
      },
      {
        type: "subheading",
        text: "Traffic",
      },
      "Web apps and mobile are two main sources to drive traffic with web web servers.",
      {
        type: "heading",
        text: "Database",
      },
      "As no. of users grow, handling everything with single servers gets hard so we uses multiple servers, web tier for traffic and data tier for database storage which can scale independently.",
      {
        type: "list",
        items: [
          "We can use Relational or Non-relational databases based on needs and requirements.",
          "In Relational DBs we can perform JOIN operations but same is not true for other.",
          "In RDBMS, data is stored in tables and rows.",
          "Non-RDMBS are grouped as key-value store, graph stores, column stores and document stores.",
        ],
      },
      {
        type: "heading",
        text: "Vertical Scaling and Horizontal Scaling",
      },
      "Vertical Scaling is increasing the size the size or capacity of a single server or store. Horizontal Scaling is increasing the no. of servers and stores. Generally Scaling Horizontally is preferred to tackle uncertinities and failures as keeping all the eggs in the same basket could led to huge loss. Also Scaling Vertically is costly and high risk prone.",
      {
        type: "heading",
        text: "Load Balancer",
      },
      "LB evenly distributes the incoming traffic among available servers. Every Load Balancer has a Public IP which we use to send requests and web servers has private IP, so LB is acting like a gateway, servers become unreachable directly from internet. LB takes the request and pass it to an approprite web server. It also helps during failover like if one server goes down then all the requests are sent to other servers and whole system stays intact without getting affected, so it removes that single point of failure we had while putting everything in a single server. During high traffic hours, new servers would be up and down during low traffic.",
      {
        type: "image",
        src: "/systemdesign/loadbalancerarchitecture.png",
        alt: "Load balancer architecture",
      },
      {
        type: "heading",
        text: "Database Replication",
      },
      "It is basically keeping the same data in multiples database. We generally uses master-slave architecture in which there is a master server where we only write data and no read operations are done, and other one is slave servers which copies data from master DB and keeps the copies which we uses for reading operations. We can have multiple such slave DBs so when one goes down whole system still stays intact. When Master server goes down we makes a slave server the temporary master though it's complex process, it's not easy to take place of master.",
      {
        type: "image",
        src: "/systemdesign/master-slave-databasereplication.png",
        alt: "Master-slave database replication",
      },
      {
        type: "heading",
        text: "Cache",
      },
      "It is a temporary storage we uses to store frequent accessed data because making DB calls are expensive and we wants to minimize the no. of DB calls we make.",
      {
        type: "subheading",
        text: "Cache tier",
      },
      "We places a middle layer between database and API, so our requests goes to cache checks if the data is there, request is directed from cache to DB and content is requested and stored cache store and from there passed to the server. It reduces the total no. of calls we make and makes the overall application efficient and fast.",
      {
        type: "image",
        src: "/systemdesign/cachetierarchitecture.png",
        alt: "Cache tier architecture",
      },
      {
        type: "subheading",
        text: "When to use Cache?",
      },
      {
        type: "list",
        items: [
          "Some data is being used Frequently",
          "Expiration Policy, should have a good expiration time as give less time and it's useless, give lots of time and data becomes stale.",
          "cache data should be as consistent as possible with the database.",
          "also mainting multiple cache stores is advisable for tacking single point of failure issue.",
        ],
      },
      {
        type: "heading",
        text: "CDN",
      },
      "Content Delivery Network(CDN) is a network of servers or stores spread across world which serves static content.",
      {
        type: "subheading",
        text: "How it works?",
      },
      "When user requests, CDN nearby delivers the content, if it's not there, it request to the origin and gets back the content and then deliver it the user and caches the data, so next time fast retrivel is possible for similar data, which ultimately reduces load times.",
      {
        type: "image",
        src: "/systemdesign/contentdeliverynetworkflow.png",
        alt: "Content delivery network flow",
      },
      {
        type: "heading",
        text: "Current Architecture Design",
      },
      {
        type: "image",
        src: "/systemdesign/currentscalablearchitecturedesign.png",
        alt: "Current scalable architecture design",
      },
      "To be continued...",
    ],
    sourceUrl: "https://hackmd.io/@paramcode/systemdesign",
  },
  {
    id: "b8",
    slug: "distributed-multi-vms-system",
    title: "Built a Distributed multi VMs system",
    date: "05.2026",
    blurb:
      "Deploying an AI inference system across public and private AWS VMs with RPC, gateways, and Terraform.",
    readTime: "10 min read",
    tags: ["AWS", "DevOps", "Distributed Systems", "Terraform", "RPC"],
    content: [
      "this article is solution of this assignment Alchemyst-ai",
      {
        type: "heading",
        text: "We are given an AI system which we can run a single system in a single process?",
      },
      {
        type: "code",
        code: "User request -> model -> response",
      },
      {
        type: "subheading",
        text: "But what problems we can have?",
      },
      {
        type: "list",
        items: [
          "What if system becomes overloaded?",
          "What if we wanna scale it?",
          "What if we wanna run 100x larger model?",
          "What if different parts of code is written in different languages?",
        ],
      },
      "So, instead of having everything in a single system we will split responsibilies.",
      {
        type: "list",
        items: ["For example here, Machine 1 for API and Machine 2 for Model Worker"],
      },
      "But one question might be coming to your mind like if we put things on a different machines then how will talk?",
      {
        type: "code",
        code: "By network communication!!\nby invoking functions remotely (Remote Procedure Call[RPC])",
      },
      "Now, let's see how the flow would look like.464",
      {
        type: "heading",
        text: "Now, think - do you expose internal machines publicly? like do you wants that anyone would come and make any no. of requests to our model?",
      },
      "No right. So what we should do? But before that let's understand what all problems we can have if we happens to do so.",
      {
        type: "list",
        items: [
          "huge amounts of bills thrown to your door.",
          "no authentication.",
          "model may die.",
          "Solution - Use Gateways: public internet -> gateway only -> private subnet workers",
        ],
      },
      {
        type: "heading",
        text: "Now, let's explore the two workers first",
      },
      {
        type: "subheading",
        text: "caller-worker or api-worker(Typescript)",
      },
      "Function:",
      {
        type: "code",
        code: "inference::get_response",
      },
      "One question might be coming to your mind like couldn't HTTP directly call Python worker? yes, obviously. we can do something like:- http request -> python worker -> response",
      "But, what are security? Like what if we wanna add:-",
      {
        type: "list",
        items: [
          "authentication (only registered users can access)",
          "logging (every request and response is stored)",
          "rate limiting (Limit the no. of requests in given timeframe)",
          "retries",
          "request validation (are we sending right request?)",
          "orchestration between many workers",
        ],
      },
      "So that's why caller worker and it's flow looks like HTTP request -> caller-worker -> python inference worker -> response",
      {
        type: "subheading",
        text: "Inference-worker (Python)",
      },
      "Function:",
      {
        type: "code",
        code: "inference::run_inference",
      },
      "What does this do? This is the actual AI brain.",
      {
        type: "list",
        items: [
          "Flow:- messages -> gemma model -> generated response",
          "Python-woker: load model, run inference, return answer",
        ],
      },
      "Like:- Input",
      {
        type: "code",
        code: "{\n  \"messages\": [\n    {\n      \"role\": \"user\",\n      \"content\": \"Explain Redis simply\"\n    }\n  ]\n}",
      },
      {
        type: "heading",
        text: "Caller-worker HTTP endpoint",
      },
      "Function:",
      {
        type: "code",
        code: "http::run_inference_over_http",
      },
      "But why do we even need this function? Because model workers don't speak “browser”. Users talk HTTP:",
      {
        type: "code",
        code: "POST /v1/chat/completions",
      },
      "Workers talk RPC. So we need translation.",
      {
        type: "heading",
        text: "Full request Cycle",
      },
      "User sends:",
      {
        type: "code",
        code: "POST /v1/chat/completions",
      },
      "with:",
      {
        type: "code",
        code: "{\n  \"messages\": [\n    {\n      \"role\": \"user\",\n      \"content\": \"What is Redis?\"\n    }\n  ]\n}",
      },
      "1. HTTP endpoint receiver request. http::run_inference_over_http. Now it forwards this request.",
      {
        type: "mermaid",
        code: "graph TD\n    A[HTTP] --> B[Extract messages]\n    B --> C[call inference::get_response]",
      },
      "2. Typescript caller worker receives. inference::get_response. It asks inference worker for response. So makes RPC call to inference::run_inference",
      "3. Python worker runs model: gemma model. Returns:-",
      {
        type: "code",
        code: "\"Redis is an in-memory data store...\"",
      },
      "4. Response bubbles back to user. Final response",
      {
        type: "code",
        code: "{\n  \"response\": \"Redis is an in-memory datastore...\"\n}",
      },
      {
        type: "heading",
        text: "Architecture",
      },
      {
        type: "mermaid",
        code: "graph TD\n    A[Public Internet] --> B[POST /v1/chat/completions]\n    B --> C[Gateway VM\\ncaller-worker TypeScript]\n    C -->|RPC over subnet| D[Worker VM\\ninference-worker Python]\n    D --> E[Gemma model]",
      },
      {
        type: "heading",
        text: "Now before moving forward let's understand some jargons first",
      },
      {
        type: "list",
        items: [
          "process? running code is process. every process has: memory, CPU usage, ports, lifecycle",
          "And our architecture is like:- Process A <---network--->Process B. We can say it as distrubed systems at smallest scale.",
          "Port? Think apartment building. Machine IP = building address. Port = apartment number.",
          "iii-workers: self contained modular processes in the iii engine; basically like robots(iii workers) working in the factory (iii engine)",
          "IaC(Infrastructure as Code): using code to manage the infrastructure like building the whole system in aws by code. Terraform ia an open-source IaC",
        ],
      },
      "Example:",
      {
        type: "code",
        code: "localhost:3000\nlocalhost:5000\n\nSame machine.\n\nDifferent services.",
      },
      {
        type: "heading",
        text: "Flow Revisited",
      },
      {
        type: "mermaid",
        code: "graph TD\n    A[User sends POST /v1/chat/completions] --> B[caller-worker HTTP trigger receives request]\n    B --> C[calls inference::get_response]\n    C --> D[caller-worker triggers RPC call]\n    D --> E[python worker inference::run_inference]\n    E --> F[Gemma model generates response]\n    F --> G[response bubbles back]\n    G --> H[HTTP JSON returned to user]",
      },
      {
        type: "mermaid",
        code: "graph TD\n    A[curl POST] --> B[127.0.0.1:3111]\n    B --> C[iii-http]\n    C --> D[http::run_inference_over_http]\n    D --> E[inference::get_response]\n    E -->|RPC| F[inference::run_inference]\n    F --> G[Gemma model]\n    G --> H[response bubbles back]",
      },
      {
        type: "heading",
        text: "Now, let's visualize how the execution flow looks like",
      },
      {
        type: "mermaid",
        code: "graph TD\n    A[iii] --> B[reads config.yaml]\n    B --> C[starts websocket engine]\n    C --> D[loads workers]\n    D --> E[starts HTTP server on 3111]\n    E --> F[workers register functions]",
      },
      "And the expected logs would be:",
      {
        type: "code",
        code: "Caller worker started\nInference worker started\nhttp server listening",
      },
      {
        type: "heading",
        text: "Okay now let's move onto understanding and deploying it into AWS",
      },
      {
        type: "list",
        items: [
          "First we will create a VPC (Virtual Private Cloud). Think it like a building where many apartments(VMs) would exist.",
          "then we will create subnets. subnets are like logical divisions of IP network like it defines the range within which a single type will exist like public or private.",
          "then Internet Gateway and NAT Gateway: Internet Gateway - inbound and outbound internet both; NAT Gateway - outbound internet",
          "Route Tables: It control the direction of traffic of subnets like where they will go, else they will be clueless",
          "Security Groups: Firewall Rules(Allows or blocks IPs)",
          "API VM and Inference VM(Virtual Machine) or 2 EC2 Machines",
        ],
      },
      {
        type: "heading",
        text: "Let's bit talk about security",
      },
      "What do you think should our model be accessible to everyone? no right? so we will place it in private subnet.",
      "But you me be thinking then how we are gonna access internet for downloading our models and dependencies? as in private subnet there is no public IP right. Yeah you are right. We are gonna use NAT gateways for that purpose we are gonna request it whatever we needs and it will bring that from the internet for us.",
      "Again another question you might be thinking how we are gonna SSH into it in the first place? We can't directly SSH into it but we can do that via the API VM",
      "like in building there are many apartments and accessible to society peoples. similarly in vpc we can jump from one private vm to another this is called bastion jump. like:- internet ---> API VM ---> inference VM",
      "Now, one question must be popping into you mind like what if someone knows our password then they can enter? yeah so for that purpose we can use firewall / security groups. and lock the SSH Port for only our IP",
      {
        type: "mermaid",
        code: "graph TD\n    E[User] --> A[Internet Gateway] --> B[API VM caller-worker + iii-http]\n    B -->|private subnet / private IP RPC websocket| C[Inference VM inference-worker]\n    C -->|response over private network| B\n    B --> A[Internet Gateway]\n    A --> E[User]\n\n    note[API VM and Inference VM are neighbors inside same VPC]",
      },
      "Implementation: https://github.com/paramcodes/devops-infra",
    ],
    sourceUrl:
      "https://paramcodes.notion.site/Built-a-Distributed-multi-VMs-system-36a5d8f3b9ed80029563e8033dc98554",
  },
  {
    id: "b9",
    slug: "building-a-rag-agent",
    title: "Building a RAG agent",
    date: "06.2026",
    blurb:
      "Document ingestion, late chunking, RAPTOR retrieval, BM25, RRF, and reranking for a RAG agent.",
    readTime: "10 min read",
    tags: ["RAG", "AI Agents", "Retrieval", "Postgres", "Jina"],
    content: [
      {
        type: "heading",
        text: "What is RAG and why we even need it?",
      },
      "Retrievel Augmented Generation(RAG) is an approach that combines the language capabilites of LLMs with the ability to access dynamic and specific data. It allows us to combine world knowledge with specialized knowledge to deliver contextful and precise answers. LLMs retrieves their data from a training dataset which is fitted to them a long while back suppose if you asked chatgpt in 2023 when he didn't had access to internet anything of your time he couldn't answer right? he can right now coz he got the ability to access the internet that is also a type of RAG you can say dynamic rag but we can not gonna talk about that one, in this blog we are gonna discuss about providing specific data source like pdf, image, url, database,etc.",
      {
        type: "heading",
        text: "Workflow",
      },
      {
        type: "image",
        src: "/blog/rag-agent/Pasted%20image%2020260601141048.png",
        alt: "RAG workflow",
      },
      {
        type: "list",
        items: [
          "Query - User asks / submits their queries",
          "Retrieval - Retrieval system searches for match in the defined sourches such as pdf and databases.",
          "Augmentation - This Retrieved information is passed to the model and used as reference / contextual foundation for generation.",
          "Generation - LLMs uses these additinal data to provide the very contextualized information / response.",
        ],
      },
      "So basically you can understand it as a extension to the LLM which we plugs in to enhance it's ability and get very specialized and present / timeless data.",
      {
        type: "heading",
        text: "Ingestion",
      },
      "We understood how the full workflow works but now let's understand how we can provide high quality data. Document ingestion is very important if we don't do it right then LLM won't understand a thing so we need to make sure we provides our data in best form.",
      {
        type: "heading",
        text: "What is Data Ingestion?",
      },
      {
        type: "list",
        items: [
          "Data Ingestion is parsing of information from external sources like pdf, webpages,etc. so that it can be embedded into a search space for later retrieval.",
          "But what is the problem even we can use any parser and parse it right? yeah, we can definitely do it for simple texts but when comes to word files or pdfs things gets messy as it contains various headings, tables, etc.",
        ],
      },
      {
        type: "image",
        src: "/blog/rag-agent/Pasted%20image%2020260601145353.png",
        alt: "Document ingestion challenge",
      },
      {
        type: "subheading",
        text: "We have two options we can either implement it byself or use some library.",
      },
      "if you wanna implement it you can read this Blog: https://aiengineering.academy/RAG/01_Data_Ingestion/data_ingestion/#key-steps-in-data-ingestion. I had implemented last time so gonna use library this time.",
      {
        type: "list",
        items: [
          "There are various options available for us some are paid and some are free. like Docling by IBM, Langchain Data Loaders, LlamaIndex, Vectorize.io, Unstructured",
        ],
      },
      "Docling parser is an open source tool / model by IBM it parses the documents with structured content gracefully. So we are gonna use docling for document processing in structured format(ex- JSON) and applying boundaries.",
      {
        type: "heading",
        text: "Chunking",
      },
      {
        type: "heading",
        text: "Early chunking vs Late chunking",
      },
      "In early chunking, we splits / segments the large document into pre-defined text units(chunks) and then we encodes every chunk in their own vector embedding(every text has meaning and embedding is way to represent that meaning in form of number in vector).It's very fast, but, while doing so we often times lose the context.",
      "Suppose, we have these sentences :- Kavya loves that flower. She lives near film city. We will create seperate embeddings for both the sentences then tell me when we search then how do we know who is She?",
      "For solving this we use Late chunking: https://arxiv.org/pdf/2409.04701",
      "In Late chunking, whole document is processed and embed using a long-context model to capture all cross-chunk relationships and meaning, and then applies the chunking boundries to those rich, full-context embeddings, which provides higher retrieval precision and semantic accuracy at the cost of higher initial computation.",
      {
        type: "image",
        src: "/blog/rag-agent/Pasted%20image%2020260601162457.png",
        alt: "Early chunking compared with late chunking",
      },
      "You can also read this for reference Blog: https://medium.com/@visrow/what-is-late-chunking-in-rag-how-can-you-improve-your-rag-with-late-chunking-f981a0cb39bb",
      {
        type: "heading",
        text: "Jina v3",
      },
      "I am gonna use jina v3 model for this purpose: https://jina.ai/news/late-chunking-in-long-context-embedding-models/",
      "So it's gonna take the whole document and process it and build embedding then instead of text we chunks tokens which ofcourse knows the whole context then create chunk embeddings. The Jina Segmenter is applied to the raw text to establish structural boundaries (e.g., paragraphs, sentences, or sections",
      "So we have processed the data and stored it in database, here i am using postgres(Prisma) for this case. you can use any vector databases.",
      "Now after processing and storage there comes the searching / matching right. we wants that whenever user enters some queries we can quickly search through our database and able to provide the relevant data to the LLM right.",
      "Suppose we have a very huge research paper then we chunk it and embed it and user queries like what is the methodology of this paper? then our previous approach would return like best 5-10 most similar chunks but chances are high it would miss the real theme as it would spread across the paper. So for this problem we can try a different approach, RAPTOR",
      {
        type: "heading",
        text: "RAPTOR",
      },
      "Recursive Abstractive Processing for Tree Organized Retrieval or RAPTOR recursively embeds, clusters and summarizes the text chunks to build a tree structure with a different level of summarization from the bottom up. https://arxiv.org/html/2401.18059v1",
      {
        type: "image",
        src: "/blog/rag-agent/Pasted%20image%2020260601172945.png",
        alt: "RAPTOR retrieval tree",
      },
      {
        type: "heading",
        text: "Workflow",
      },
      "Leaf nodes are the original document chunks(fine-grained). Intermediate notes are cluster summaries(medium abstraction). The root node is the global summary(high abstraction). Every node(leaf and summary both) is embeded and stored and when you query / search, you search all of them at once.",
      {
        type: "subheading",
        text: "How the tree is built.",
      },
      {
        type: "list",
        items: [
          "Embed all leaf chunks: Each chunk from docling -> Jina v3 -> 1024-dimensional vector",
          "Reduce dimension with UMAP(Uniform Manifold Approximation and Projection): UMAP is a dimensionality reduction algorithm while preserving the relationships and structure of the original data. Why reduce? because everything is so far in higher dimension. It is hard to find meaningful clusters.",
          "Cluster with HDBSCAN: Hierarchical Density-Based Spatial Clustering of Application with Noise or HDBSCAN is an unsupervised algorithm to find clusters or groups of chunks are semantically close. https://hdbscan.readthedocs.io/en/latest/how_hdbscan_works.html",
          "Summarize each cluster with Gemini: For each cluster, concentage all chunk texts and send to the gemini and let it generate the summary and use that summary to create a new node one level up.",
          "Repeat Recursively: Embed summaries and cluster them. Summarize again. and keep doing this until you are left with just one cluster(root).",
        ],
      },
      {
        type: "image",
        src: "/blog/rag-agent/Pasted%20image%2020260601184645.png",
        alt: "RAPTOR tree construction",
      },
      {
        type: "heading",
        text: "Retrieval Flow",
      },
      "At query time we don't traverse the tree top-down. We are gonna use collapsed retrieval technique, flattening all nodes from all levels into one pool ans search everything at once. By, doing this we are gonna get big picture as well as specific details simultaneously.",
      "We are gonna store all the nodes in our vector database",
      {
        type: "heading",
        text: "BM25",
      },
      "Suppose we wanna some term like what is cosine similarity? then searching from previous strategy is inefficient so we can use another algorithm which is designed for this specific purpose BM25(Best Matching 25).",
      {
        type: "heading",
        text: "RRF(Retrieval Rank Fusion)",
      },
      "It is a powerful algorithm used to merge and rerank search results from different retrieval methods so we can gonna give it our vector and keyword search. Hence it would help us in getting better results.",
      {
        type: "heading",
        text: "Jina Reranker",
      },
      "After we got our result we can pass it through this which will again find the most relavant and near to the context data among them which will again help in sending the best of best related data to the LLM.",
      {
        type: "heading",
        text: "LLM",
      },
      "Finally we will Pass the final result to the LLM and get our answer.",
      {
        type: "image",
        src: "/blog/rag-agent/Pasted%20image%2020260601183354.png",
        alt: "RAG agent final architecture",
      },
      "I know i am not good at writing blogs. If you still make it till here, Thanks for reading. :)",
      {
        type: "image",
        src: "/blog/rag-agent/atlas_endpoints.svg",
        alt: "Atlas RAG API endpoints",
      },
      {
        type: "image",
        src: "/blog/rag-agent/atlas_architecture.svg",
        alt: "Atlas RAG architecture",
      },
    ],
    sourceUrl: "https://paramveer.hashnode.dev/building-rag-agent",
  },
];

export const BLOG_POSTS: BlogPost[] = _POSTS.map((post) => ({
  ...post,
  content: fixContent(post.content),
}));
