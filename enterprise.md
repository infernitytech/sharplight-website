---
title: AI on your own servers
lead: >-
  Sharplight Server runs AI models for your whole organization on hardware you control: easy to run, private by design,
  at a predictable cost.
description: >-
  On-premise AI for organizations from Infernity Technologies GmbH: Sharplight Server, sized inference hardware and
  consulting. Your data stays in your network.
permalink: /enterprise/
status: Early access
cta:
  primary: { label: Talk to us, url: "mailto:contact@infernity.at?subject=Sharplight%20Enterprise" }
---

## Easy to run

- **Installed in minutes.** A setup wizard takes you from first start to a working system and checks each step.
- **Grows with you.** Start with one server. Add machines and they join the cluster; upgrades go machine by machine while the
  others keep serving.
- **The models your teams need.** Current open models such as Llama, Qwen, Gemma and Mistral, from a tested and signed
  model feed.
- **Ready for everyone.** A chat interface for staff, standard APIs for your applications.

## Your data stays with you

- **On your premises.** Prompts, documents and answers are processed on your servers. No external AI provider is involved.
- **Designed for GDPR (DSGVO) compliance.** Data never leaves your infrastructure: no transfer to an external AI
  provider or to a third country.
- **Strict separation.** Departments or clients work in isolated spaces: separate data, models, keys and caches.
- **Your sign-in.** Active Directory / LDAP, OpenID Connect or SAML, with multi-factor authentication and roles.

## Predictable cost

- **No per-token fees.** You run on your own hardware; cost does not rise with every request.
- **Hardware that fits.** We size servers for your models and number of users and deliver them with Sharplight
  installed and tested.
- **Advice before you invest.** We help you choose use cases, models and capacity, so you buy what you need.

## What you get

<div class="grid">
<div class="card" markdown="1">

### Software

**Sharplight Server**, in early access. Cluster, tenants, sign-in and model management for Linux and Windows Server.

</div>
<div class="card" markdown="1">

### Hardware

Inference servers sized for your workload, with Sharplight preinstalled.

</div>
<div class="card" markdown="1">

### Consulting

Use cases, rollout, integration into your systems.

</div>
</div>

Each is available on its own.

<p><a class="btn" href="mailto:contact@infernity.at?subject=Sharplight%20Enterprise">Talk to us</a></p>

Tell us which models you have in mind, how many people will use them, and what hardware you have or plan.

## For your IT team

- **Cluster.** Equal nodes behind any load balancer; placement by GPU and memory capacity; failover to other nodes;
  rolling upgrades. PostgreSQL is the only infrastructure dependency.
- **APIs.** OpenAI- and Anthropic-compatible endpoints per space; existing clients change base URL and key.
- **Models.** The first version serves language models and embeddings. The engine underneath also runs speech, vision,
  image and video models: [model list]({{ '/models/' | relative_url }}).
- **Performance.** Measured against llama.cpp, vLLM and onnxruntime, gaps included: [benchmarks]({{ '/benchmarks/' | relative_url }}).
- **Engine.** Open source (MIT); it already serves one machine with API keys:
  [docs]({{ '/docs/' | relative_url }}), [serving guide]({{ '/docs/serving/' | relative_url }}).

Sharplight Server is commercial software in development. Early access is being arranged with a small number of
organizations; we do not announce dates we cannot keep.
