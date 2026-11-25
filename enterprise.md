---
layout: enterprise
title: AI on your own servers
lead: >-
  Sharplight Server runs AI models for your whole organization on hardware you control: easy to run, private by design,
  at a predictable cost.
description: >-
  On-premise AI for organizations from Infernity Technologies GmbH: Sharplight Server, sized inference hardware and
  consulting. Your data stays in your network.
permalink: /enterprise/
status: Early access
---
<div class="feature-row">
<div class="card feature" markdown="1">
<span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></svg></span>

### Easy to run

- **Installed in minutes.** A setup wizard takes you from first start to a working system and checks each step.
- **Grows with you.** Start with one server. Add machines and they join the cluster; upgrades go machine by machine while the
  others keep serving.
- **The models your teams need.** Current open models such as Llama, Qwen, Gemma and Mistral, from a tested and signed
  model feed.
- **Ready for everyone.** A chat interface for staff, standard APIs for your applications.

</div>
<div class="card feature" markdown="1">
<span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></span>

### Your data stays with you

- **On your premises.** Prompts, documents and answers are processed on your servers. No external AI provider is involved.
- **Designed for GDPR (DSGVO) compliance.** Data never leaves your infrastructure: no transfer to an external AI
  provider or to a third country.
- **Strict separation.** Departments or clients work in isolated spaces: separate data, models, keys and caches.
- **Your sign-in.** Active Directory / LDAP, OpenID Connect or SAML, with multi-factor authentication and roles.

</div>
<div class="card feature" markdown="1">
<span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg></span>

### Predictable cost

- **No per-token fees.** You run on your own hardware; cost does not rise with every request.
- **No GPU vendor lock-in.** Runs on NVIDIA, AMD and Intel GPUs, so you choose hardware by price and availability.
- **Hardware that fits.** We size servers for your models and number of users and deliver them with Sharplight
  installed and tested.
- **Advice before you invest.** We help you choose use cases, models and capacity, so you buy what you need.

</div>
</div>

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

<p class="center muted">Each is available on its own.</p>

<p class="center cta-after"><a class="btn btn-big" href="mailto:contact@infernity.at?subject=Enterprise">Talk to us</a></p>

<p class="center muted">Tell us which models you have in mind, how many people will use them, and what hardware you have or plan.</p>

<section class="it-team" markdown="1">

### For your IT team

- **Cluster.** Equal nodes behind any load balancer; placement by GPU and memory capacity; failover to other nodes;
  rolling upgrades. PostgreSQL is the only infrastructure dependency.
- **APIs.** OpenAI- and Anthropic-compatible endpoints per space; existing clients change base URL and key.
- **Models.** The first version serves language models and embeddings. The engine underneath also runs speech, vision,
  image and video models: [model list]({{ '/models/' | relative_url }}).
- **Performance.** Serving throughput level with vLLM on one GPU, 1.6-3.2x of llama.cpp's with 16-64 users on Vulkan
  GPUs; measured with the same model files on every engine, gaps included: [performance overview]({{ '/benchmarks/' | relative_url }}),
  [technical benchmarks]({{ '/benchmarks/technical/' | relative_url }}).
- **Engine.** Open source (MIT); it already serves one machine with API keys:
  [docs]({{ '/docs/' | relative_url }}), [serving guide]({{ '/docs/serving/' | relative_url }}).

<p class="muted small">Sharplight Server is commercial software in development. Early access is being arranged with a small number of organizations; we do not announce dates we cannot keep.</p>

</section>
