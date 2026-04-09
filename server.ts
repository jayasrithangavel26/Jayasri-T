import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Sample Research Papers Data
  const researchPapers = [
    {
      id: 1,
      title: "Advancements in Transformer Architectures for Long-Context Understanding",
      abstract: "This paper explores novel attention mechanisms designed to handle sequences exceeding 100k tokens. We introduce 'Linear-Sparse Attention' which reduces computational complexity from quadratic to linear while maintaining high accuracy in retrieval tasks.",
      methodology: "Empirical evaluation on the LongBench dataset using a modified Llama-2 architecture.",
      keywords: ["Transformers", "Long Context", "Attention Mechanism", "NLP"]
    },
    {
      id: 2,
      title: "Ethical Implications of Generative AI in Medical Diagnosis",
      abstract: "As LLMs are increasingly used for clinical decision support, concerns regarding bias and hallucination persist. This study analyzes 500 clinical cases where AI-generated advice was compared against expert consensus.",
      methodology: "Qualitative analysis and double-blind expert review of AI-generated medical reports.",
      keywords: ["Healthcare", "AI Ethics", "Generative AI", "Clinical Decision Support"]
    },
    {
      id: 3,
      title: "Sustainable AI: Reducing the Carbon Footprint of Large-Scale Training",
      abstract: "Training state-of-the-art models consumes significant energy. We propose a 'Green-Training' framework that optimizes hardware utilization and introduces early-stopping criteria based on energy efficiency metrics.",
      methodology: "Comparative study of energy consumption across different GPU clusters and training schedules.",
      keywords: ["Sustainability", "Green AI", "Energy Efficiency", "Model Training"]
    },
    {
      id: 4,
      title: "Zero-Shot Cross-Lingual Transfer in Low-Resource Languages",
      abstract: "Many languages lack sufficient training data for modern NLP models. This research investigates how multilingual pre-training can be leveraged for zero-shot performance in African dialects.",
      methodology: "Fine-tuning XLM-RoBERTa on a curated dataset of 15 low-resource languages.",
      keywords: ["Multilingualism", "Low-Resource Languages", "Cross-Lingual Transfer", "NLP"]
    },
    {
      id: 5,
      title: "The Role of Reinforcement Learning from Human Feedback (RLHF) in Reducing Toxicity",
      abstract: "RLHF has become a standard for aligning LLMs with human values. We quantify the reduction in toxic outputs across three major model families after applying various RLHF techniques.",
      methodology: "Automated toxicity scoring and human evaluation of model responses to adversarial prompts.",
      keywords: ["RLHF", "AI Alignment", "Toxicity Reduction", "Safety"]
    },
    {
      id: 6,
      title: "Privacy-Preserving Machine Learning via Federated Learning in Mobile Edge Computing",
      abstract: "Data privacy is a major hurdle for AI adoption in sensitive sectors. This paper presents a federated learning approach that keeps data on-device while aggregating model updates in a secure manner.",
      methodology: "Simulated deployment on a network of 1000 edge devices with varying connectivity.",
      keywords: ["Privacy", "Federated Learning", "Edge Computing", "Security"]
    },
    {
      id: 7,
      title: "Neural Architecture Search for Efficient Vision Transformers on Mobile Devices",
      abstract: "Vision Transformers (ViTs) are powerful but computationally expensive. We use Neural Architecture Search (NAS) to find optimal ViT configurations that run in real-time on standard mobile processors.",
      methodology: "Evolutionary algorithm-based NAS optimized for latency and accuracy on mobile hardware.",
      keywords: ["Computer Vision", "NAS", "Mobile AI", "Vision Transformers"]
    },
    {
      id: 8,
      title: "Explainable AI (XAI) in Autonomous Vehicle Navigation",
      abstract: "Trust in autonomous systems requires transparency. This study introduces a visual explanation module that highlights the features in the environment driving the vehicle's steering decisions.",
      methodology: "Integration of Grad-CAM visualizations into a deep reinforcement learning navigation agent.",
      keywords: ["XAI", "Autonomous Vehicles", "Computer Vision", "Transparency"]
    },
    {
      id: 9,
      title: "Graph Neural Networks for Drug Discovery: A Comparative Study",
      abstract: "Predicting molecular properties is essential for drug development. We compare several Graph Neural Network (GNN) architectures on their ability to predict binding affinity for small molecules.",
      methodology: "Benchmarking GCN, GAT, and MPNN on the ZINC and MoleculeNet datasets.",
      keywords: ["Drug Discovery", "GNN", "Bioinformatics", "Molecular Modeling"]
    },
    {
      id: 10,
      title: "Quantum Machine Learning: Potential and Pitfalls in the NISQ Era",
      abstract: "Quantum computing promises exponential speedups for certain tasks. We evaluate the current state of Variational Quantum Classifiers on Noisy Intermediate-Scale Quantum (NISQ) hardware.",
      methodology: "Implementation of quantum circuits on IBM Q hardware and comparison with classical SVMs.",
      keywords: ["Quantum Computing", "QML", "NISQ", "Optimization"]
    }
  ];

  // API Routes
  app.get("/api/papers", (req, res) => {
    res.json(researchPapers);
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
