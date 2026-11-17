---
title: Sharplight Server
lead: >-
  On-premise AI inference for an organization: several machines working as one cluster, separate tenants, your identity
  provider, OpenAI- and Anthropic-compatible endpoints. A commercial product from the makers of Sharplight, in development.
description: Sharplight Server is a commercial on-premise inference platform in development, with clustering, tenant isolation and enterprise sign-in.
permalink: /server/
status: In development
cta:
  primary: { label: Write to us, url: "mailto:contact@infernity.at?subject=Sharplight%20Server" }
---

**Status: in development.** Sharplight Server has not been released. This page describes what is planned for the first
version. If it fits a need you have, [write to us](mailto:contact@infernity.at?subject=Sharplight%20Server): early access
is being arranged with a small number of organizations, and what you need shapes the order of the work.

## Why a server product

The open-source engine already serves models over HTTP from one process on one machine, and Sharplight Studio does the
same on a desktop. An organization needs more around that: more than one machine, more than one team, sign-in through the
company directory, and someone other than a developer being able to operate it. Sharplight Server is that layer. It uses
the same engine, so the models, formats and measured behavior are the ones documented on this site.

## One cluster from the machines you have

- **Every node is equal.** Each node accepts requests and can host models. Put any load balancer in front, or none.
- **Placement by capacity.** The cluster decides which node runs which model from what the model needs and what each
  machine's GPUs and memory can hold. Machines of different sizes can be mixed.
- **Routing.** A request that arrives at one node is served by whichever node has the model ready and free capacity.
  Requests that share a conversation prefix go to the node that already has it cached.
- **Resilience.** When a node fails, its models are started on other nodes that have capacity. Model packages are kept on
  more than one node, so recovery does not depend on downloading them again.
- **Growing and maintaining.** Add a node and it starts taking models. Drain a node before maintenance and running
  requests finish first, so upgrades can go node by node.

## Accounts, spaces and strict isolation

- **Accounts and spaces.** An account is a tenant, for example a company or a department. A space inside it is a team or
  an application, with its own models, endpoints, members and API keys.
- **Endpoints per space.** Each space gets its own OpenAI- and Anthropic-compatible endpoints. Existing client libraries
  work by changing the base URL and the key.
- **Nothing crosses a space boundary.** An API key belongs to one user in one space and is refused everywhere else. A
  space sees only its own models, under its own names. Stored conversations, files and usage records are kept per space.
- **Caches are separated too.** Several spaces can share one loaded copy of a model's weights, while cached prompt
  prefixes are kept apart per space, so one tenant's requests cannot be inferred from another's response times.
- **A chat interface** for the people in a space, next to the API.

## Sign-in and roles

- **Your identity provider.** Active Directory and LDAP, OpenID Connect and SAML, alongside local accounts.
- **Multi-factor authentication.**
- **Roles at each level.** Cluster administrators look after nodes and models; account administrators look after their
  spaces and members; space administrators choose models and endpoints; users work in the spaces they belong to. Directory
  groups can be mapped to roles.

## Models

- **A verified, signed model feed.** Models are delivered as packages that were tested with the engine and signed, and
  are verified again before they are installed.
- **The engine's breadth.** Sharplight runs language models, embeddings and rerankers, speech, vision, image and video
  models ([see the model list]({{ '/models/' | relative_url }})). The first version of the server concentrates on
  language models and embeddings behind the chat and API endpoints.

## Setup and deployment

- **A setup wizard** takes a new installation from first start to a working cluster, checking each step (database,
  certificates, hardware) as it goes. The same setup can be scripted for repeatable installations.
- **PostgreSQL** is the only infrastructure dependency.
- **Linux and Windows Server.**
- **On your premises.** The server runs on your machines, in your network.

## Sharplight and Sharplight Server

| | Sharplight and Sharplight Studio | Sharplight Server |
|---|---|---|
| License | Open source (MIT) | Commercial, closed source |
| Status | Available now (alpha) | In development |
| Runs on | One machine: a process, a desktop, a single server | A cluster of machines |
| Serving | OpenAI- and Anthropic-compatible endpoints from one process; API keys | Endpoints per space, routed across nodes |
| Several models | Load on demand, eviction within one machine's memory | Placement across nodes by capacity |
| Users | Whoever holds a key, or the desktop user | Accounts, spaces, roles |
| Sign-in | API keys | Active Directory / LDAP, OpenID Connect, SAML, multi-factor |
| Tenant isolation | Fair sharing between callers | Strict separation of data, models, keys and caches |
| Models | Any supported file; verified catalog in Studio | Verified, signed model feed |
| Setup | NuGet package or desktop installer | Setup wizard; PostgreSQL |
| Support | Community, on GitHub | From the vendor |

Everything in the left column stays available and open source. If one machine and API keys are enough, you do not need
the server: the [serving guide]({{ '/docs/serving/' | relative_url }}) shows how to run the open-source engine as a service today.

## Hardware and services

Sharplight Server is developed by Infernity Technologies GmbH. For organizations that want more than the software, the
company offers two things alongside it. Neither is required: the server is planned to run on machines you already own, and
nothing in the open-source products depends on a contract.

### Hardware

Pre-configured inference servers for your own premises. We ask which models you intend to run, for how many people, and
how you expect that to grow, and size a machine for that load: GPUs, memory, storage. It arrives with Sharplight Server
installed and tested on that hardware, ready to join your network or an existing cluster.

### Consulting

Help with the questions that come before and after the installation:

- **Use cases**: which tasks in your organization are a good fit for locally run models, and which are not.
- **Model selection**: which models meet your quality, language and licensing needs within the hardware you have or plan.
- **Deployment and infrastructure planning**: sizing, network placement, operation and upgrades.
- **Integration**: connecting your applications through the OpenAI- and Anthropic-compatible APIs.
- **Privacy and compliance**: what running AI on your own premises changes for data protection, and what it does not.

## What to expect from us

- No prices are published while the product is unfinished. They will be when it ships.
- No release date we cannot keep. Early-access participants hear about progress directly.
- The benchmark and compatibility pages on this site describe the engine the server uses, including its gaps.

## Get in touch

One address for the server, hardware and consulting: [contact@infernity.at](mailto:contact@infernity.at?subject=Sharplight%20Server).
It helps to mention the models you want to run, roughly how many people would use them, and the machines you have or plan.
