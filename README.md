# ClinicalBERT — BERT Pre-trained on EHR Clinical Notes

Repository for [Publicly Available Clinical BERT Embeddings](https://www.aclweb.org/anthology/W19-1909/) (NAACL Clinical NLP Workshop 2019)

A suite of BERT models pre-trained on MIMIC-III clinical notes, designed for downstream clinical NLP tasks including Named Entity Recognition (NER) and Natural Language Inference (NLI).

---

## 🚀 Frontend

This repository includes a modern Next.js frontend for exploring ClinicalBERT models and documentation.

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to view the interface.

---

## Using Clinical BERT

ClinicalBERT is available directly through the [HuggingFace Transformers](https://github.com/huggingface/transformers) library — no manual download required for most use cases.

```python
from transformers import AutoTokenizer, AutoModel

tokenizer = AutoTokenizer.from_pretrained("emilyalsentzer/Bio_ClinicalBERT")
model = AutoModel.from_pretrained("emilyalsentzer/Bio_ClinicalBERT")
```

See the model pages on HuggingFace:
- [Bio+Clinical BERT](https://huggingface.co/emilyalsentzer/Bio_ClinicalBERT)
- [Bio+Discharge Summary BERT](https://huggingface.co/emilyalsentzer/Bio_Discharge_Summary_BERT)

---

## Download Clinical BERT (TensorFlow Checkpoints)

For TensorFlow-based workflows, the checkpoints can be downloaded via:

```bash
wget -O pretrained_bert_tf.tar.gz https://www.dropbox.com/s/8armk04fu16algz/pretrained_bert_tf.tar.gz?dl=1
```

| Checkpoint | Description |
|---|---|
| `biobert_pretrain_output_all_notes_150000` | Bio+Clinical BERT — all MIMIC-III notes, 150K steps |
| `biobert_pretrain_output_disch_100000` | Bio+Discharge Summary BERT — discharge notes, 100K steps |
| `bert_pretrain_output_all_notes_150000` | Clinical BERT — all MIMIC-III notes, cased BERT base |
| `bert_pretrain_output_disch_100000` | Discharge Summary BERT — discharge notes, cased BERT base |

Both `biobert_*` models are fine-tuned from [BioBERT-Base v1.0 (+ PubMed 200K + PMC 270K)](https://github.com/naver/biobert-pretrained). Both `bert_*` models are fine-tuned from `cased_L-12_H-768_A-12`.

---

## Reproduce Clinical BERT

### Pre-training

To reproduce the full pre-training pipeline on MIMIC-III data:

1. **Format MIMIC data** — Run `lm_pretraining/format_mimic_for_BERT.py` after setting your input/output file paths.
2. **Create pre-training data** — Run `lm_pretraining/create_pretrain_data.sh` to generate masked TFRecord shards.
3. **Fine-tune the language model** — Run `lm_pretraining/finetune_lm_tf.sh`.

> **Note:** See issue [#4](https://github.com/EmilyAlsentzer/clinicalBERT/issues/4) for improvements to the section splitting code.

### Downstream Tasks

| Task | Script |
|---|---|
| MedNLI (Natural Language Inference) | `downstream_tasks/run_classifier.sh` |
| i2b2 NER (Named Entity Recognition) | `downstream_tasks/run_i2b2.sh` |

> ⚠️ **Current limitation:** The frontend and tooling currently provide *guidelines* for running these tasks manually. See [`FUTURE_PLAN.md`](./FUTURE_PLAN.md) for the roadmap to wire models in directly.

---

## Project Structure

```
BERT-Model-using-EHR-Records/
├── frontend/               # Next.js UI (pink/glassmorphism theme)
│   ├── app/
│   ├── components/
│   └── ...
├── lm_pretraining/         # Pre-training scripts
│   ├── format_mimic_for_BERT.py
│   ├── create_pretrain_data.sh
│   └── finetune_lm_tf.sh
├── downstream_tasks/       # NER and NLI fine-tuning
│   ├── run_classifier.sh
│   └── run_i2b2.sh
├── FUTURE_PLAN.md          # Roadmap for direct model integration
└── README.md
```

---

## Contact

Please post a [GitHub issue](https://github.com/EmilyAlsentzer/clinicalBERT/issues) or contact emilya@mit.edu with any questions.

---

## Citation

Please acknowledge the following work in papers or derivative software:

> Emily Alsentzer, John Murphy, William Boag, Wei-Hung Weng, Di Jin, Tristan Naumann, and Matthew McDermott. 2019. Publicly available clinical BERT embeddings. In *Proceedings of the 2nd Clinical Natural Language Processing Workshop*, pages 72–78, Minneapolis, Minnesota, USA. Association for Computational Linguistics.

```bibtex
@inproceedings{alsentzer-etal-2019-publicly,
    title = "Publicly Available Clinical {BERT} Embeddings",
    author = "Alsentzer, Emily  and
      Murphy, John  and
      Boag, William  and
      Weng, Wei-Hung  and
      Jin, Di  and
      Naumann, Tristan  and
      McDermott, Matthew",
    booktitle = "Proceedings of the 2nd Clinical Natural Language Processing Workshop",
    month = jun,
    year = "2019",
    address = "Minneapolis, Minnesota, USA",
    publisher = "Association for Computational Linguistics",
    url = "https://www.aclweb.org/anthology/W19-1909",
    doi = "10.18653/v1/W19-1909",
    pages = "72--78"
}
```
