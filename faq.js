/* ============================================================================
   faq.js — the pricing page's FAQ block, on the two surfaces that sell
   ============================================================================
   A reproduction of the FAQ section of thingsboard.io/pricing: the title, the
   category rail down the left, the accordion on the right, six answers and a
   `Load more FAQ`. It is mounted UNDER THE PLANS on the two surfaces that show a
   price list to someone who has not bought yet — the signed-out landing page and
   Home's first-run screen — and nowhere else. Both already render the same picker
   off the same data; this is the third thing they now share.

   ⚠️ OWN FILE, NOT data.js. 57KB of it is other people's prose, and the rule that
   sends mock data to data.js is about the prototype's own fixtures. Copy this size
   would double that file for something one surface pair reads — and the repo lives
   on Google Drive, where a big write is the documented way to trigger a sync
   lockout. Data and renderer sit together here for the same reason license-details.js
   does: one surface, one place.

   ⚠️ THE COPY IS THE SITE'S, WORD FOR WORD — it is not written here and must not be
   edited here. It was lifted out of the served HTML of
   `thingsboard.io/pricing/?section=thingsboard-pe-options&product=thingsboard-pe`
   (contexts `thingsboard-pe` and `tbmq-pe-payg`), 89 and 59 answers. Four mechanical
   changes were made to the MARKUP and none to the words:
     · site-root links (`/contact-us/`) became absolute. This prototype is served from
       a subfolder, so `/contact-us/` would resolve against the portal's own root and
       404. The "relative paths only" rule is about the prototype's OWN files;
       an off-site link has to be absolute or it is not that link.
     · every `<a>` carries `target="_blank" rel="noopener"`; attributes the site uses
       for its own widgets were dropped.
     · `&rarr;` inside a navigation path became the sprite's chevron. A character
       standing in for a mark is what the icon rule forbids — and a NAMED entity is a
       fourth spelling the checker does not decode, so it would have ridden in
       unnoticed. See the three-spellings note in NOTES.
     · three `Plan Calculator` links pointed at the site's own calculator modal
       (`href="#" data-open-calc`). This prototype has no calculator, so they point at
       the pricing page that hosts it. `inferred`.

   ⚠️ TWO SETS, CHOSEN BY PRODUCT, and one of them is a judgement call. The site splits
   TBMQ self-managed into two FAQ contexts, Pay-as-you-go and Perpetual; ThingsBoard
   has a single self-managed context covering both. This prototype's selling surface
   shows both billing models at once and switches on PRODUCT only, so TBMQ takes the
   Pay-as-you-go set under the unqualified title `TBMQ Self-managed FAQs`. `inferred`:
   if the block has to follow the billing tab as well, the second context is another
   key in FAQ_CONTENT and one more argument here.

   ⚠️ TYPOGRAPHY IS THE PROTOTYPE'S, NOT THE SITE'S. The reference is a dark marketing
   page with a display-size title; what is reproduced is the LAYOUT and the behaviour
   (rail, accordion, six then all). The heading takes h2 like every other section
   heading in this product, and the whole block is monochrome.
   ============================================================================ */

/* Six, then the rest in one go, then the button leaves — measured on the site. */
var FAQ_SHOWN = 6;

var FAQ_CONTENT = {
  thingsboard: {
    title:'ThingsBoard Self-managed FAQs',
    cats:[
    { label:'General', items:[
      { q:'What is a self-managed subscription?',
        a:'<p>A self-managed subscription allows you to host and manage ThingsBoard on your own infrastructure, either on-premises or in the cloud. You are responsible for the installation, configuration, and ongoing management of the system, while ThingsBoard provides the software and necessary documentation to support the process.</p>' },
      { q:'How can I buy a self-managed subscription?',
        a:'<p>To purchase a self-managed subscription, you can acquire a license through your <a href="https://license.thingsboard.io/" target="_blank" rel="noopener">License Server</a> account. Each license comes with a unique activation key, which allows you to deploy and run the system by following our detailed installation guides.</p>' },
      { q:'How to purchase a Perpetual license?',
        a:'<p>If you would like to explore the Perpetual option, please <a href="https://thingsboard.io/contact-us/" target="_blank" rel="noopener">contact our sales team</a></p>' },
      { q:'What does it mean to get the license?',
        a:'<p>Licensing is applicable to self-hosted platform versions only. Each license comes with a unique license key (activation code) that is automatically generated in your <a href="https://license.thingsboard.io/" target="_blank" rel="noopener">License Server</a> account. Using this license key, you can deploy and run the system by following our detailed installation guides.</p>' },
      { q:'What self-managed subscription plans does ThingsBoard offer?',
        a:'<p>ThingsBoard offers flexible monthly subscription plans, with tiers based on the number of devices and assets. We support 5 predefined plans to cater to different needs. The beginner plan includes support for up to 10 devices. For more details, visit the ThingsBoard <a href="https://thingsboard.io/pricing/?product=thingsboard-pe" target="_blank" rel="noopener">pricing page</a>.</p>' },
      { q:'How do the self-managed subscription plans differ?',
        a:'<p>Plans differ based on the number of devices, support level, and white-labeling availability.</p>' },
      { q:'Is there a contract or commitment for the subscription?',
        a:'<p>No, all subscriptions are month-to-month, and you can cancel anytime.</p>' },
      { q:'Do I need to host ThingsBoard myself with a subscription license?',
        a:'<p>Yes, you are responsible for deploying and managing ThingsBoard on your own infrastructure.</p>' },
      { q:'Can I upgrade or downgrade my subscription at any time?',
        a:'<p>Yes, you can change plans anytime, and billing will be prorated accordingly.</p>' },
      { q:'What happens if I exceed the device or asset limits in my plan?',
        a:'<p>If you exceed your plan\'s limits, you will need to upgrade to a higher-tier plan. With the Business plan, you can also purchase additional devices on a monthly basis at a rate of $0.10 per extra device.</p>' },
      { q:'Can I migrate from a ThingsBoard Cloud subscription to a self-managed license?',
        a:'<p>Please, <a href="https://thingsboard.io/contact-us/" target="_blank" rel="noopener">contact us</a> in case migration assistance is needed.</p>' },
      { q:'Are all ThingsBoard features included in every plan?',
        a:'<p>White labeling is offered starting from the Prototype plan and above.</p>' },
      { q:'Can I use my license across multiple locations or instances?',
        a:'<p>A platform instance can be installed on a single server, which may be a virtual machine, a running Docker container, or a single OS process. If you need to run the platform across multiple locations or as part of a clustered deployment, you can purchase additional instances for any plan as required. <br><br></p><p>By default, each license includes a predefined number of platform instances. The Maker, Prototype, and Pilot plans include one instance, the Startup plan includes two instances, and the Business plan includes three instances.</p>' },
      { q:'Is it possible to jump from subscription to perpetual?',
        a:'<p>Customer may cancel the subscription and purchase a perpetual license. The remaining costs from the terminated subscription plan (if any) will be deducted from the total cost for the perpetual license. The perpetual license is non-refundable. Once purchased, it cannot be canceled.</p>' },
      { q:'Can I migrate from one server or Virtual machine to another using the same license?',
        a:'<p>Yes! You can migrate your license by activating or deactivating it on the License Server. To move to a new server, deactivate the current instance, install the software on the new server, and reuse your existing license key. Be sure to back up your data if you want to maintain the same environment. Note: The license system prevents running ThingsBoard Professional Edition on multiple servers at the same time unless you purchase additional instances.</p>' },
      { q:'What is included in the White-Labeled Mobile App add-on?',
        a:'<p>The White-Labeled Mobile App add-on provides you with a branded version of the ThingsBoard Mobile application. This includes your company\'s name, logo, colors, and other branding elements. The cost is $99 per month, plus a one-time setup fee of $1,000 to cover branding and configuration.</p>' }
    ] },
    { label:'Billing & Payments', items:[
      { q:'How does billing work for self-managed subscriptions?',
        a:'<p>Billing is handled via Stripe and is charged monthly based on your selected plan. You can also pay annually with card or wire transfer. Please <a href="https://thingsboard.io/contact-us/" target="_blank" rel="noopener">contact us</a> to receive a custom invoice.</p>' },
      { q:'What payment methods do you accept?',
        a:'<p>We accept credit and debit cards through Stripe. You can also pay annually with card or wire transfer. Please <a href="https://thingsboard.io/contact-us/" target="_blank" rel="noopener">contact us</a> to receive a custom invoice.</p>' },
      { q:'I cannot pay by card, may we use wire instead?',
        a:'<p>Sure. In this case, you must reach out to our sales team via <a href="https://thingsboard.io/contact-us/" target="_blank" rel="noopener">contact us</a>. If you have ongoing communication with the account manager or success manager on our end, please refer your request to that person.</p>' },
      { q:'Do you offer an annual payment option?',
        a:'<p>We currently offer only a monthly subscription with automatic payments via Stripe. For annual payments, please <a href="https://thingsboard.io/contact-us/" target="_blank" rel="noopener">contact</a> our team to arrange a wire transfer invoice.</p>' },
      { q:'What happens if my payment fails?',
        a:'<p>If a payment fails, Stripe will retry the charge several times. If unsuccessful, your license will be suspended.</p>' },
      { q:'Can I cancel my subscription anytime?',
        a:'<p>Yes, you can cancel your subscription anytime.</p>' },
      { q:'Are refunds available if I cancel my subscription?',
        a:'<p>No, we do not offer refunds for unused time. However, the funds for the remaining period will be saved on your account balance for future use.</p>' },
      { q:'Is there proration when upgrading or downgrading my plan?',
        a:'<p>Yes, Stripe automatically prorates the charges when you change plans.</p>' },
      { q:'Do you offer discounts for multiple licenses?',
        a:'<p>Contact our <a href="https://thingsboard.io/contact-us/" target="_blank" rel="noopener">sales team</a> for bulk pricing options.</p>' },
      { q:'What happens if I don\'t renew my subscription?',
        a:'<p>Your license will become inactive, and your ThingsBoard instance will be suspended.</p>' },
      { q:'Can I transfer my subscription to another entity?',
        a:'<p>No, subscriptions are non-transferable. However, you can add users to your License Server account, allowing others to help manage the license subscription.</p>' },
      { q:'Is there an additional payment for the software use besides the license fee?',
        a:'<p>No, we do not charge extra unless you want an additional service that we offer: professional support, Custom development and consulting, Training, or Managed service. </p>' }
    ] },
    { label:'Usage, Deployments & Limits', items:[
      { q:'What are the device and asset limits for each plan?',
        a:'<p>Maker: 10 devices<br>Prototype: 50 devices<br>Pilot: 100 devices<br>Startup: 500 devices<br>Business: 1000 devices, with the option to purchase additional devices at $0.10 per device per month</p>' },
      { q:'What does the number of production instances mean?',
        a:'<p>A <b>Production Instance</b> refers to a single node of the ThingsBoard platform within your deployment. While one instance is enough to run your solution, multiple instances allow you to operate in <b>Cluster Mode</b>. <br><br></p><p>By running multiple instances, you achieve:</p><ul><li><b>High Availability (HA):</b> Your system remains operational even if a node goes down.</li><li><b>Horizontal Scalability:</b> Distribute the processing load across multiple servers to handle more devices and data.</li><li><b>Reliability:</b> Built-in redundancy for mission-critical IoT applications.</li></ul>' },
      { q:'What happens if I exceed my plan\'s device or asset limit?',
        a:'<p>You will need to upgrade to a higher-tier plan. With the Business plan, you also have the option to purchase additional devices at $0.10 per device per month.</p>' },
      { q:'Can I use my license on multiple servers?',
        a:'<p>A platform instance can be installed on a single server, which may be a virtual machine, a running Docker container, or a single OS process. If you need to run the platform across multiple locations or as part of a clustered deployment, you can purchase additional instances for any plan as required. <br><br></p><p>By default, each license includes a predefined number of platform instances. The Maker, Prototype, and Pilot plans include one instance, the Startup plan includes two instances, and the Business plan includes three instances.</p>' },
      { q:'Does ThingsBoard charge for API calls or storage?',
        a:'<p>No, but you may be charged by your cloud provider for resource usage.</p>' },
      { q:'Do I need an internet connection to use the self-managed license?',
        a:'<p>Yes, an internet connection is required for periodic license verification. The system checks the license once per hour, and if the connection is not restored within 24 hours, the platform may shut down. This process ensures proper license management while allowing temporary connectivity issues. For more details, please refer to the license check <a href="https://thingsboard.io/docs/license-server/what-is-license-server/" target="_blank" rel="noopener">description</a>. Offline mode is also possible as an add-on to the Perpetual license. <a href="https://thingsboard.io/contact-us/" target="_blank" rel="noopener">Contact our sales team</a> to know more.</p>' },
      { q:'Can I run offline?',
        a:'<p>By default, the platform requires active Internet access or at least access to license portal from your host machine. If Offline access is a must, please <a href="https://thingsboard.io/contact-us/" target="_blank" rel="noopener">contact us</a> to discuss options.</p>' },
      { q:'Can I move my deployment between cloud providers?',
        a:'<p>Yes, self-managed ThingsBoard is cloud-agnostic and can be migrated as needed.</p>' },
      { q:'Does ThingsBoard support high-availability (HA) setups?',
        a:'<p>Yes, High Availability (HA) is supported and can be achieved through ThingsBoard services and database replication. Please note that each ThingsBoard replica will require a separate license.</p>' },
      { q:'Can I back up my ThingsBoard instance?',
        a:'<p>Yes, backups depend on your database and storage setup.</p>' },
      { q:'How is telemetry data stored in self-managed ThingsBoard?',
        a:'<p>ThingsBoard supports PostgreSQL or PostgreSQL + Cassandra (Hybrid mode) for telemetry storage. For more details on database options, you can check the <a href="https://thingsboard.io/docs/reference/architecture/database/" target="_blank" rel="noopener">database approach reference</a>.</p>' },
      { q:'Does ThingsBoard support multi-tenancy?',
        a:'<p>Yes, multi-tenancy is supported out of the box.</p>' },
      { q:'How to charge my customers?',
        a:'<p>So far, the ThingsBoard platform does not provide a billing module to charge end customers. At the same time, the platform exposes the <a href="https://thingsboard.cloud/swagger-ui/#/usage-info-controller" target="_blank" rel="noopener">Usage API</a> that can be used by the external payment software to generate invoices.</p>' }
    ] },
    { label:'Security & Compliance', items:[
      { q:'Is my ThingsBoard instance secure?',
        a:'<p>Security depends on your infrastructure setup, but ThingsBoard provides built-in authentication, role-based access control, and encryption.</p>' },
      { q:'Where is my ThingsBoard data stored?',
        a:'<p>Your data is stored on your own infrastructure, whether on-premise or in the cloud.</p>' },
      { q:'Can I store ThingsBoard data in my preferred region?',
        a:'<p>Yes, you have full control over data storage location.</p>' },
      { q:'Can I export my data at any time?',
        a:'<p>Yes, you can export your data using the ThingsBoard dashboard, APIs, or by creating a full database backup.</p>' },
      { q:'Do you provide pentest results?',
        a:'<p>No, we do not do it for many reasons. Firstly, as a platform vendor, we cannot disclose detected vulnerabilities of certain versions of the platform as the disclosure affects the safety of our existing customers who use that particular version. Secondly, the self-declared pentest is less trustworthy as it is in the vendor\'s interest to come up with clean results and you never know whether to believe them or not. Lastly, the penetration test makes more sense to be conducted over a ready-to-use end client software/application to define weak spots (if any). It is the Licensee\'s responsibility to order independent testing. Having said that, the ThingsBoard platform gives one a tool to develop solutions. You may consider the platform a building that a banker rents to establish an office, vault, etc. Now you can see that testing a building itself does not make much sense. But things change when it hosts a bank (or whatever tenant).</p>' },
      { q:'Where can I find the logged vulnerability fixes matrix: version + list of fixes?',
        a:'<p>Please stay tuned with our <a href="https://thingsboard.io/docs/pe/releases/releases-table/" target="_blank" rel="noopener">Release notes</a>. Critical vulnerabilities or security issues are mentioned in separate line items. Less threatful vulnerabilities appear as a single record ("Vulnerability fixes") stating that, at the release date, the version is free of known HIGH and some MEDIUM CVEs.</p>' }
    ] },
    { label:'Trials, Cancellations & Refunds', items:[
      { q:'Can I try a self-managed license before subscribing?',
        a:'<p>Yes, the Maker plan ($10/month) is a low-cost way to explore the platform. It also includes trial license for Edge and Trendz products, so you can fully test the ThingsBoard ecosystem.</p>' },
      { q:'What happens if I cancel my subscription?',
        a:'<p>Your license will become inactive, and your ThingsBoard instance will be stopped.</p>' },
      { q:'Can I switch from a subscription license to a perpetual license?',
        a:'<p>Customer may cancel the subscription and purchase a perpetual license. The remain costs from terminated subscription plan (if remain) will be deducted from Total cost for the perpetual license. The perpetual license is non-refundable. Once purchased, it cannot be canceled.</p>' },
      { q:'Are refunds available for self-managed subscriptions?',
        a:'<p>No, all sales are final.</p>' }
    ] },
    { label:'Support & Assistance', items:[
      { q:'What support is included in my subscription?',
        a:'<ul><li><b>Maker and Prototype:</b> Community support.</li><li><b>Startup:</b> Support with 36-hour response time during regular working shifts via Support Portal. <em>Please note: Support for the Startup plan becomes available from the second month of usage.</em></li><li><b>Business:</b> Support with 12-hour response time during regular working shifts via Support Portal.</li></ul>' },
      { q:'Do you offer 24/7 support?',
        a:'<p>Yes, we can provide 24/7 support as part of our managed services with an additional signed SLA. Please <a href="https://thingsboard.io/contact-us/" target="_blank" rel="noopener">contact us</a> for more details.</p>' },
      { q:'How can I get help with installation and setup?',
        a:'<p>If your subscription plan includes response time support and you have access to the Support Portal, the ThingsBoard support team can assist with system deployment as part of the subscription. However, this applies only if you follow recommended installation methods and architecture. Custom installation scripts or non-recommended deployment scenarios are not covered under included support. If your subscription plan does not include support, then we recommend using our documentation, tutorials, and optional professional services. To discuss options, please <a href="https://thingsboard.io/contact-us/" target="_blank" rel="noopener">contact us</a>.</p>' },
      { q:'How do I contact support?',
        a:'<p>Users of Startup and higher subscriptions, as well as perpetual license holders, are automatically added to the ThingsBoard <a href="https://thingsboard-portal.atlassian.net/servicedesk/customer/portal/1" target="_blank" rel="noopener">Support Portal</a> after purchasing a license.</p>' },
      { q:'What issues are included in subscription support?',
        a:'<p>Access to the ThingsBoard Support Portal is available for users with Startup and higher subscriptions, as well as perpetual license holders. Without the need for a separate support agreement, all support inquiries are seamlessly managed through a unified queue, ensuring efficient handling of your requests. Our support team is dedicated to providing an initial response within 24 hours to address your needs promptly. <br><br></p><p>The support service includes assistance with installation and migration for default deployments, as well as resolving any questions related to the platform\'s out-of-the-box functionalities, as detailed in our documentation. For specialized services such as consulting, code reviews, health assessments, or development projects, we offer tailored solutions to meet your specific requirements. Should your request involve additional expertise, our support engineers will guide you to the best resources to ensure your success.</p>' },
      { q:'Can you provide an IoT development service tailored to my specific needs?',
        a:'<p>Yes, we offer custom <a href="https://thingsboard.io/services/development-services/" target="_blank" rel="noopener">IoT development services</a> designed to match your exact requirements. Whether you need a full-featured IoT platform, scalable architecture, or specific integrations, our IoT development team can help you accelerate time-to-market and reduce internal workload while ensuring long-term maintainability.</p>' }
    ] },
    { label:'Edge', items:[
      { q:'What is Edge Computing add-on?',
        a:'<p>The Edge Computing add-on enables local data processing at remote sites through ThingsBoard Edge PE instances. Edge runs independently with offline capability and automatically syncs with your central ThingsBoard PE Server when connectivity returns.</p><p>It is available for all ThingsBoard PE deployments: Cloud, Private Cloud, and self-managed.</p>' },
      { q:'What pricing plans does Edge Computing add-on offer?',
        a:'<p>Edge Computing add-on pricing depends on your ThingsBoard model. Check the relevant pricing in the <a href="https://thingsboard.io/pricing/" target="_blank" rel="noopener">Plan Calculator</a>.</p>' },
      { q:'Does Edge work with both ThingsBoard PE and CE?',
        a:'<p>Edge edition must match your ThingsBoard Server edition:</p><ul><li><b>Edge PE</b> connects to ThingsBoard PE Server.</li><li><b>Edge CE</b> connects to ThingsBoard CE Server.</li></ul><p>Note: Community Editions are free and open-source.</p>' },
      { q:'Can I use Edge without ThingsBoard?',
        a:'<p>No, Edge PE requires a ThingsBoard PE Server (Cloud, Private Cloud, or self-managed) to provision devices, sync configurations, and exchange data. However, it processes data locally and can operate offline when the connection drops.</p>' },
      { q:'Do you offer a free trial for Edge?',
        a:'<p>You can start with the <b>Free</b> plan (limited to 10 devices) with the Edge Computing add-on permanently enabled. This lets you explore Edge PE features at no cost.</p><p>For larger deployments, you can upgrade to paid plans with higher device limits and additional features.</p>' },
      { q:'Can Edge handle my device volume?',
        a:'<p>We recommend up to 1,000 devices per Edge instance based on typical edge hardware and connectivity constraints. You can exceed this number depending on your hardware capabilities. For more capacity, deploy multiple Edge instances or, starting with version 4.0, cluster Edge nodes for high availability.</p>' },
      { q:'How many edge instances are included in Edge Computing add-on?',
        a:'<p>The number of included Edge instances depends on your subscription plan. Additional instances can be purchased separately. Check your plan details or <a href="https://thingsboard.io/contact-us/" target="_blank" rel="noopener">contact us</a> for specifics.</p>' },
      { q:'What\'s included in the Edge Computing add-on price?',
        a:'<p>The Edge add-on includes: software license, software updates (duration varies by license type), and support level based on your ThingsBoard PE plan. Hardware and infrastructure are not included — you provide your own edge hardware.</p>' },
      { q:'How to activate or cancel Edge Computing add-on license?',
        a:'<p>To activate your Edge Computing add-on, log in to the License Portal and follow this path:</p><p><b>ThingsBoard license details <svg class="ic faq-arrow" aria-hidden="true"><use href="assets/icons.svg#ti-chevron-right"></use></svg> Manage Add-ons <svg class="ic faq-arrow" aria-hidden="true"><use href="assets/icons.svg#ti-chevron-right"></use></svg> Enable the checkbox for Edge Computing add-on <svg class="ic faq-arrow" aria-hidden="true"><use href="assets/icons.svg#ti-chevron-right"></use></svg> Save the changes.</b></p><p>If you cancel your license before the billing period ends, the funds for the remaining period will stay on your balance but will not be refundable.</p>' },
      { q:'What hardware is required to run Edge Instance?',
        a:'<p>Edge runs on any machine meeting these minimums:</p><ul><li><b>Light workloads:</b> 1GB+ RAM, 2 CPU cores, 10GB storage (e.g., Raspberry Pi).</li><li><b>Heavy use:</b> 4GB+ RAM, 4+ CPU cores, 20GB+ storage (e.g., Industrial PCs, Edge servers, VMs).</li></ul>' },
      { q:'How is Edge Computing add-on billed?',
        a:'<p>Edge Computing add-on is billed monthly, along with your main ThingsBoard subscription. The price depends on your plan plus any additional instances you purchase.</p>' },
      { q:'I have devices that use proprietary protocols. Can Edge connect to them?',
        a:'<p>Yes. Edge natively supports MQTT, CoAP, HTTP, SNMP, and LwM2M. For other protocols, use:</p><ul><li>The <b>ThingsBoard IoT Gateway</b> to bridge legacy devices. The Gateway supports Modbus, BACnet, OPC-UA, and more, and is available at no extra cost.</li><li>The <b>Platform Integrations</b> to connect via OPC-UA, ChirpStack, and 30+ other systems using the converter library.</li></ul>' },
      { q:'Is UI customization available out of the box?',
        a:'<p>The Edge Computing add-on includes UI customization out of the box, such as white-labeling (custom branding throughout the interface) and custom menu configuration — both available without code changes.</p>' },
      { q:'Is my Edge instance secure?',
        a:'<p>Security depends on your infrastructure setup, but Edge provides built-in authentication, role-based access control, and encryption.</p>' },
      { q:'Are software updates included?',
        a:'<p>Yes. Software updates are included with active Edge licenses:</p><ul><li><b>Subscription licenses:</b> Receive updates throughout the subscription period.</li><li><b>Perpetual licenses:</b> Include 1 year of updates, renewable annually.</li></ul>' },
      { q:'What happens when my Edge subscription expires?',
        a:'<p>Your Edge instance will stop functioning when the license expires. You\'ll need to renew your Edge license to continue using the instance.</p><p>For <b>perpetual licenses</b>, only updates and support expire — the Edge instance continues running.</p>' },
      { q:'Can I upgrade from Edge CE to Edge PE?',
        a:'<p>Yes, but you\'ll need to upgrade your entire system: upgrade your ThingsBoard Server from CE to PE, purchase the Edge Computing add-on, and reinstall Edge using PE packages. Please <a href="https://thingsboard.io/contact-us/" target="_blank" rel="noopener">contact us</a> for migration assistance.</p>' },
      { q:'Do I need a separate license to use Edge Computing add-on?',
        a:'<p>No. Once you have an active ThingsBoard PE license (Cloud, Private Cloud, or self-managed), you can purchase and activate the Edge Computing add-on directly. The add-on itself serves as the license for your Edge instances. No additional licensing is required.</p>' }
    ] },
    { label:'Trendz', items:[
      { q:'What is Trendz?',
        a:'<p>Trendz is an add-on for advanced IoT Data Analytics. It allows you to analyze, detect anomalies, and predict outcomes — all in one unified analytics workspace that works seamlessly with ThingsBoard. You can check pricing in the <a href="https://thingsboard.io/pricing/" target="_blank" rel="noopener">Plan Calculator</a>.</p>' },
      { q:'What pricing plans does Trendz offer?',
        a:'<p>Trendz pricing depends on your ThingsBoard model. You can check the relevant pricing in the <a href="https://thingsboard.io/pricing/" target="_blank" rel="noopener">Plan Calculator</a> on this page.</p>' },
      { q:'How to activate or cancel Trendz license?',
        a:'<p>To activate your Trendz license, log in to the License Portal and follow this path:</p><p><b>ThingsBoard license details <svg class="ic faq-arrow" aria-hidden="true"><use href="assets/icons.svg#ti-chevron-right"></use></svg> Manage Add-ons <svg class="ic faq-arrow" aria-hidden="true"><use href="assets/icons.svg#ti-chevron-right"></use></svg> Enable the checkbox for Trendz <svg class="ic faq-arrow" aria-hidden="true"><use href="assets/icons.svg#ti-chevron-right"></use></svg> Save the changes.</b></p><p>If you cancel your license before the billing period ends, the funds for the remaining period will stay on your balance but will not be refundable.</p>' },
      { q:'Is there an additional payment for the software use besides the license fee?',
        a:'<p>No, we do not charge extra unless you want an additional service that we offer, such as:</p><ul><li>Professional support</li><li>Custom development and consulting</li><li>Training</li><li>Managed services</li></ul>' },
      { q:'Does Trendz work with both ThingsBoard PE and CE?',
        a:'<p>No, Trendz can be integrated with ThingsBoard Professional Edition (PE), but it is not available in ThingsBoard Community Edition (CE).</p>' },
      { q:'Can ThingsBoard and Trendz Analytics have different license types?',
        a:'<p>No, ThingsBoard and Trendz Analytics must have the same license type to function correctly. Trendz Analytics automatically detects all devices and assets from your ThingsBoard instance, along with their relationships.</p><p>It analyzes all entities without the option to select specific ones. You can\'t select specific devices or assets; all entities will be analyzed and added to the \'business entity\' column.</p>' },
      { q:'Can I use Trendz without ThingsBoard?',
        a:'<p>No, you cannot use Trendz without ThingsBoard. Trendz automatically detects and analyzes all entities from your ThingsBoard instance. Without ThingsBoard, Trendz has no data source to work with, making it incompatible for use on its own.</p>' },
      { q:'Is white labeling available out of the box?',
        a:'<p>White labeling functionality is available starting from the <b>Pilot</b> subscription.</p>' },
      { q:'Do you offer a free trial for Trendz?',
        a:'<p>ThingsBoard Maker includes Trendz for free. If you need a free trial for other subscriptions, <a href="https://thingsboard.io/contact-us/" target="_blank" rel="noopener">Contact us</a> for details.</p>' },
      { q:'What support is included in my plan?',
        a:'<p>The <b>Maker</b> and <b>Prototype</b> subscriptions include Community-level support. Starting from the <b>Startup</b> subscription, customers gain access to the ThingsBoard Support Portal for direct communication with the support team.</p><p><i>Community support is a free initiative provided by the Trendz team and other contributors as a voluntary effort. While our engineers often assist with community requests during their free time, this support comes with no formal obligation from the Trendz team. We highly encourage users to consult the documentation for guidance.</i></p>' },
      { q:'Which server should Trendz Analytics be installed on?',
        a:'<p>Trendz can be installed on the same server as your ThingsBoard instance or on a separate server, depending on your preferences and infrastructure.</p>' },
      { q:'Can I back up my Trendz instance?',
        a:'<p>Yes, backups depend on your database and storage setup.</p>' },
      { q:'Is my Trendz instance secure?',
        a:'<p>Security depends on your infrastructure setup, but Trendz provides built-in authentication, role-based access control, and encryption.</p>' },
      { q:'How can I get help with installation and setup?',
        a:'<p>If your subscription plan includes basic support and you have access to the Support Portal, the Trendz support team can assist with system deployment as part of basic support. However, this applies only if you follow recommended installation methods and architecture. Custom installation scripts or non-recommended deployment scenarios are not covered under basic support.</p><p>If your subscription plan does not include basic support, we recommend using our documentation, tutorials, and optional professional services. To discuss options, please <a href="https://thingsboard.io/contact-us/" target="_blank" rel="noopener">contact us</a>.</p>' }
    ] }
    ]
  },
  tbmq: {
    title:'TBMQ Self-managed FAQs',
    cats:[
    { label:'General', items:[
      { q:'What is a self-managed subscription?',
        a:'<p>A self-managed subscription allows you to host and manage TBMQ on your own infrastructure, either on-premises or in the cloud. You are responsible for the installation, configuration, and ongoing management of the system, while TBMQ team provides the software and necessary documentation to support the process.</p>' },
      { q:'How can I buy a self-managed subscription?',
        a:'<p>To purchase a self-managed subscription, you can acquire a license through your <a href="https://license.thingsboard.io/" target="_blank" rel="noopener">License Server</a> account. Each license comes with a unique activation key, which allows you to deploy and run the system by following our detailed <a href="https://tbmq.io/docs/pe/installation/" target="_blank" rel="noopener">installation guides</a>.</p>' },
      { q:'What does it mean to get the license?',
        a:'<p>Licensing is applicable to self-hosted platform versions only. Each license comes with a unique license key (activation code) that is automatically generated in your <a href="https://license.thingsboard.io/" target="_blank" rel="noopener">License Server</a> account. Using this license key, you can deploy and run the system by following our detailed <a href="https://tbmq.io/docs/pe/installation/" target="_blank" rel="noopener">installation guides</a>.</p>' },
      { q:'What self-managed subscription plans does TBMQ offer?',
        a:'<p>TBMQ Professional Edition operates on a flexible, consumption-based licensing model rather than using predefined subscription tiers. We offer a single Pay-as-you-go (PAYG) subscription model for self-managed deployments. This structure provides complete control over your licensing costs, as your monthly fee is calculated precisely based on the capacity you configure in the calculator for Sessions, Throughput, and Instances. This ensures you only pay for the exact resources and features you require, allowing your deployment to scale dynamically without being restricted by fixed plan limits.</p>' },
      { q:'Why does the TBMQ Self-managed Subscription utilize a detailed capacity calculator instead of offering fixed plans?',
        a:'<p>TBMQ utilizes a detailed capacity calculator to ensure our licensing model is highly flexible and fully transparent. We do not offer fixed subscription plans because we want you to be in complete control of your deployment costs. The calculator is your primary tool for licensing, allowing you to define the exact capacity required for Sessions, Throughput, and Instances. This approach ensures optimal cost efficiency by matching your payment precisely to the resources you consume, allowing for dynamic scaling without the constraints of predefined tiers.</p>' },
      { q:'What is the minimum configuration and cost for a TBMQ Self-managed Subscription?',
        a:'<p>The minimum configuration for the TBMQ Self-managed Subscription grants you the base licensing capacity required to run the TBMQ Professional Edition. This configuration is priced at $15.00 per month and includes the following minimum licensed resources:<br>* 100 Sessions<br>* 100 messages per second (msg/sec) Throughput<br>* 1 Production Instance<br>* Community Support<br>This configuration is typically used for initial testing, proof-of-concept deployments, and qualifies for the 30-day free trial.</p>' },
      { q:'Is there a contract or commitment for the subscription?',
        a:'<p>No, all subscriptions are month-to-month, and you can cancel anytime.</p>' },
      { q:'Do I need to host TBMQ myself with a subscription license?',
        a:'<p>Yes, you are responsible for deploying and managing TBMQ on your own infrastructure.</p>' },
      { q:'Can I upgrade or downgrade my subscription at any time?',
        a:'<p>Yes, the TBMQ Self-managed Pay-as-you-go model is explicitly designed for complete flexibility. You can adjust your licensed capacity for Sessions, Throughput, and Instances at any time using the self-managed calculator. Any changes you make will take effect immediately and will be reflected proportionally in your next monthly billing cycle. This allows you to dynamically scale your resources up or down to perfectly match your deployment\'s current demands.</p>' },
      { q:'What happens if I exceed the total messages per second or session limit in my subscription?',
        a:'<p>If your TBMQ deployment exceeds the licensed limit for either Sessions or Throughput messages per second, the broker software will enforce the capacity defined in your license key. This typically means that new client connections or incoming messages will be rejected, or your deployment performance may be throttled until usage falls back below the purchased capacity. To maintain continuous service and prevent disruption, we recommend proactively monitoring your capacity usage and adjusting your licensed limits via the <a href="https://license.thingsboard.io/" target="_blank" rel="noopener">License Portal</a> before reaching your peak operational thresholds.</p>' },
      { q:'Are all TBMQ features included in the subscription?',
        a:'<p>Yes, all core TBMQ features are included. The only exception to the comprehensive feature set is White Labeling, which is available as an optional add-on that can be purchased separately.</p>' },
      { q:'Can I use my license across multiple locations or instances?',
        a:'<p>Yes, your TBMQ Professional Edition license is fully portable across your self-managed infrastructure. By default, your license includes one Production Instance, and you have the option to purchase additional Production or Development Instances as needed for increased scale, high availability (HA), or isolated testing. Once these resources are licensed, you are free to deploy them anywhere you need—across multiple data centers, regions, or cloud environments—to support your architectural and redundancy requirements. The license covers the total number of purchased instances, Sessions, and Throughput regardless of their geographical location.</p>' },
      { q:'Can I migrate from one server or container to another using the same license?',
        a:'<p>Yes! You can migrate your license by activating or deactivating it on the License Server. To move to a new server, deactivate the current instance, install the software on the new server, and reuse your existing license key. Be sure to back up your data if you want to maintain the same environment. Note: The license system prevents running TBMQ Professional Edition on more servers than allowed by the subscription at the same time unless you purchase additional instances.</p>' },
      { q:'Is it possible to jump from subscription to perpetual?',
        a:'<p>Customer may cancel the subscription and purchase a perpetual license. The remaining costs from the terminated subscription plan (if any) will be deducted from the total cost for the perpetual license. The perpetual license is non-refundable. Once purchased, it cannot be canceled.</p>' }
    ] },
    { label:'Billing & Payments', items:[
      { q:'How does billing work for self-managed subscriptions?',
        a:'<p>Billing is handled via Stripe and is charged monthly based on your configured subscription.</p>' },
      { q:'What payment methods do you accept?',
        a:'<p>We accept credit and debit cards through Stripe.</p>' },
      { q:'I cannot pay by card, may we use wire instead?',
        a:'<p>Sure. In this case, you must reach out to our sales team via <a href="https://thingsboard.io/contact-us/?subject=TBMQ" target="_blank" rel="noopener">contact us</a>. If you have ongoing communication with the account manager or success manager on our end, please refer your request to that person.</p>' },
      { q:'Do you offer an annual payment option?',
        a:'<p>We currently offer only a monthly subscription with automatic payments via Stripe. For annual payments, please <a href="https://thingsboard.io/contact-us/?subject=TBMQ" target="_blank" rel="noopener">contact</a> our team to arrange a wire transfer invoice.</p>' },
      { q:'What happens if my payment fails?',
        a:'<p>If a payment fails, Stripe will retry the charge several times. If unsuccessful, your license will be suspended.</p>' },
      { q:'Can I cancel my subscription anytime?',
        a:'<p>Yes, you can cancel your subscription anytime.</p>' },
      { q:'Are refunds available if I cancel my subscription?',
        a:'<p>No, we do not offer refunds for unused time. However, the funds for the remaining period will be saved on your account balance for future use.</p>' },
      { q:'Is there proration when upgrading or downgrading my plan?',
        a:'<p>Yes, Stripe automatically prorates the charges when you change plans.</p>' },
      { q:'Do you offer discounts for multiple licenses?',
        a:'<p>Contact our <a href="https://thingsboard.io/contact-us/?subject=TBMQ" target="_blank" rel="noopener">sales team</a> for bulk pricing options.</p>' },
      { q:'What happens if I don’t renew my subscription?',
        a:'<p>Your license will become inactive, and your TBMQ instance will be suspended.</p>' },
      { q:'Can I transfer my subscription to another entity?',
        a:'<p>No, subscriptions are non-transferable. However, you can add users to your License Server account, allowing others to help manage the license subscription.</p>' },
      { q:'Is there an additional payment for the software use besides the license fee?',
        a:'<p>No, we do not charge extra unless you want an additional service that we offer: professional support, custom development and consulting, training, or managed service.</p>' },
      { q:'What is the price for extra Production and Development Instances?',
        a:'<p>Additional Production and Development Instances are priced at a fixed rate of $100 and $50 per instance per month, respectively. This allows you to scale your fault-tolerance and dedicated testing environments as needed, ensuring you only pay for the extra nodes you license.</p>' },
      { q:'What is the unit price for additional Sessions capacity?',
        a:'<p>Sessions capacity is licensed on a flexible per-session, per-month basis. You can license any amount you require. The effective unit rate is calculated as $5.00 per 100 Sessions.</p>' },
      { q:'What is the unit price for additional Throughput capacity?',
        a:'<p>Throughput capacity is licensed on a flexible per-message-per-second (msg/sec), per-month basis. You can license any amount you require. The effective unit rate is calculated as $10.00 per 100 messages per second (msg/sec).</p>' }
    ] },
    { label:'Usage & Limits', items:[
      { q:'What exactly counts as a “session”?',
        a:'<p>A session is any active connection between an MQTT client and the TBMQ broker. Each session represents a single client, uniquely identified by its client ID, and counts toward your session quota.<br><br>If a client connects and maintains an active session, it occupies one slot in the session quota. When session persistence is enabled, a disconnected client still occupies a session slot, since its session data (subscriptions, messages, etc.) is retained by the broker.<br><br>A session slot is released only when the session has either expired or been explicitly removed. This means your session quota includes both currently connected clients and any disconnected clients with persisted sessions. Only clients with fully expired or deleted sessions free up capacity for new connections.</p>' },
      { q:'How is “throughput (msg/sec)” defined and metered?',
        a:'<p>Throughput (total messages per second) refers to the combined number of MQTT PUBLISH packets processed by the TBMQ each second. This includes both incoming messages from publishers and outgoing messages delivered to subscribers.<br><br>For example, if 100 devices each publish 10 messages per second, that results in 1,000 incoming messages per second. If each message is delivered to 2 subscribers, the outgoing volume is 2,000 messages per second. In this case, the total messages per second would be 3,000.<br><br>Only MQTT PUBLISH packets are counted—control packets like CONNECT, SUBSCRIBE, PINGREQ, etc., are excluded. This metric reflects the actual messaging throughput of your deployment and is used to ensure performance and SLA compliance.</p>' },
      { q:'What is production instance?',
        a:'<p>A Production Instance is the core unit of deployment for TBMQ Professional Edition, representing a single, dedicated TBMQ broker node. This node is licensed exclusively for processing live client traffic, including all licensed Sessions and Throughput. In a self-managed environment, an instance is typically deployed as a Docker container or a Kubernetes pod. While one instance is usually included in the base license, customers often purchase additional instances to create a fault-tolerant cluster for high availability (HA) and increased reliability.</p>' },
      { q:'What is development instance?',
        a:'<p>A Development Instance is a dedicated TBMQ broker node—typically deployed as a Docker container or Kubernetes pod—that is licensed exclusively for non-production activities. This includes staging, testing, QA, and CI/CD workflows. The primary purpose of using a dedicated Development Instance is to ensure isolated environments for testing and integration without risking the integrity or performance of your live Production deployment or contaminating production data.</p>' },
      { q:'Can I add anything to the subscription?',
        a:'<p>Yes, the self-managed subscription allows you to enhance your license with two specialized add-ons. The White Labeling add-on enables full customization of the broker interface to seamlessly match your corporate branding. The Priority Help Desk add-on moves your support requests into a high-priority queue managed by the expert TBMQ team, ensuring they are triaged and addressed ahead of standard tickets for faster processing of critical operations.</p>' },
      { q:'What is White Labeling add-on?',
        a:'<p>The White Labeling add-on is an optional feature that allows you to fully customize the TBMQ broker interface and deployment components to match your corporate branding. This removes all TBMQ branding from the control panel and deployment environment, enabling you to deliver a unified and seamless experience to your end-users or internal teams. This is primarily used by organizations integrating TBMQ as a core part of their own product or corporate infrastructure.</p>' },
      { q:'What is Priority Help Desk add-on?',
        a:'<p>The Priority Help Desk add-on provides an elevated support service level by moving your support requests directly into a high-priority queue managed by the TBMQ expert team. This ensures your critical operations receive front-of-line attention, and your requests are triaged and addressed ahead of standard tickets. It is important to note that while priority status accelerates processing within the queue, it does not guarantee a faster response time.</p>' },
      { q:'Since there are no fixed plans, how is my maximum Session and Throughput capacity established?',
        a:'<p>Since the TBMQ Self-managed Subscription operates on a Pay-as-you-go model, your maximum Session and Throughput capacities are established entirely by you. You use the self-managed calculator to configure the exact limits needed for your deployment. The license then grants you a total aggregate capacity up to those chosen values. Your license fee is calculated based on the unit rates for the selected Sessions and Throughput capacity, rather than being determined by fixed tiers.</p>' },
      { q:'What happens if I exceed my subscription’s throughput (messages per second) or session limit?',
        a:'<p>If your TBMQ deployment exceeds the licensed limit for either Sessions or Throughput messages per second, the broker software will enforce the capacity defined in your license key. This typically means that new client connections or incoming messages will be rejected, or your deployment performance may be throttled until usage falls back below the purchased capacity. To maintain continuous service and prevent disruption, we recommend proactively monitoring your capacity usage and adjusting your licensed limits via the calculator before reaching your peak operational thresholds.</p>' },
      { q:'Can I use my license on multiple servers?',
        a:'<p>Yes, your TBMQ Professional Edition license is portable across multiple physical and virtual servers, data centers, and cloud environments. The license grants you a total pool of Sessions, Throughput, and Instances. Each server running a broker must be covered by one of your licensed Production or Development Instances. Crucially, the license key enforces a strict one-to-one mapping: you cannot use a single license entitlement (e.g., 1 Production Instance) to run concurrently on two separate servers or nodes. You can purchase additional Instances as needed for high availability, fault tolerance, and scale, and deploy those licensed units wherever they are required to meet your architectural needs.</p>' },
      { q:'Does TBMQ charge for API calls or storage?',
        a:'<p>No, but you may be charged by your cloud provider for resource usage.</p>' },
      { q:'Do I need an internet connection to use the self-managed license?',
        a:'<p>Yes, an internet connection is required for periodic license verification. The system checks the license once per hour, and if the connection is not restored within 24 hours, the platform may shut down. This process ensures proper license management while allowing temporary connectivity issues. For more details, please refer to the license check <a href="https://thingsboard.io/docs/license-server/what-is-license-server/#architecture" target="_blank" rel="noopener">description</a>.</p>' },
      { q:'Can I run offline?',
        a:'<p>By default, the platform requires active Internet access or at least access to license portal from your host machine. If Offline access is a must, please <a href="https://thingsboard.io/contact-us/?subject=TBMQ" target="_blank" rel="noopener">contact us</a> to discuss options.</p>' },
      { q:'Can I move my deployment between cloud providers?',
        a:'<p>Yes, self-managed TBMQ is cloud-agnostic and can be migrated as needed.</p>' },
      { q:'Does TBMQ support high-availability (HA) setups?',
        a:'<p>Yes, High Availability (HA) is supported and can be achieved through TBMQ services and database replication. Please note that each TBMQ replica will require a separate license.</p>' },
      { q:'Can I back up my TBMQ instance?',
        a:'<p>Yes, backups depend on your database and storage setup.</p>' }
    ] },
    { label:'Security & Compliance', items:[
      { q:'Is my TBMQ instance secure?',
        a:'<p>Security depends on your infrastructure setup, but TBMQ provides built-in authentication, role-based access control, and encryption.</p>' },
      { q:'Where is my TBMQ data stored?',
        a:'<p>Your data is stored on your own infrastructure, whether on-premise or in the cloud.</p>' },
      { q:'Can I store TBMQ data in my preferred region?',
        a:'<p>Yes, you have full control over data storage location.</p>' },
      { q:'Do you provide pentest results?',
        a:'<p>No, we do not do it for many reasons. Firstly, as a broker vendor, we cannot disclose detected vulnerabilities of certain versions of the platform as the disclosure affects the safety of our existing customers who use that particular version. Secondly, the self-declared pentest is less trustworthy as it is in the vendor’s interest to come up with clean results and you never know whether to believe them or not. Lastly, the penetration test makes more sense to be conducted over a ready-to-use end client software/application to define weak spots (if any). It is the Licensee’s responsibility to order independent testing.</p>' },
      { q:'Where can I find the logged vulnerability fixes matrix: version + list of fixes?',
        a:'<p>Please stay tuned with our <a href="https://tbmq.io/docs/pe/releases/" target="_blank" rel="noopener">Release notes</a>. Critical vulnerabilities or security issues are mentioned in separate line items. Less threatful vulnerabilities appear as a single record (“Vulnerability fixes”) stating that, at the release date, the version is free of known HIGH and some MEDIUM CVEs.</p>' }
    ] },
    { label:'Trials, Cancellations & Refunds', items:[
      { q:'Can I try a self-managed license before subscribing?',
        a:'<p>Yes, TBMQ offers a 30-day free trial for the self-managed Professional Edition license, which is available exclusively for the minimum capacity configuration: 100 Sessions, 100 messages per second (msg/sec), and 1 Production Instance. This trial allows you to fully test the broker\'s performance and core features within your own infrastructure without any financial commitment. At the end of the 30 days, you can choose to transition to a paid subscription, either maintaining that minimum configuration or scaling up your capacity as required.</p>' },
      { q:'What happens if I cancel my subscription?',
        a:'<p>Your license will become inactive, and your TBMQ instance will be stopped.</p>' },
      { q:'Are refunds available for self-managed subscriptions?',
        a:'<p>No, all sales are final.</p>' },
      { q:'Can I switch from a subscription license to a perpetual license?',
        a:'<p>Customer may cancel the subscription and purchase a perpetual license. The remain costs from terminated subscription plan (if remain) will be deducted from Total cost for the perpetual license. The perpetual license is non-refundable. Once purchased, it cannot be canceled.</p>' }
    ] },
    { label:'Support & Assistance', items:[
      { q:'What support is included in my subscription?',
        a:'<p>The included Support tier for the TBMQ Self-managed Subscription is tied to the total monthly cost of the license. The foundational Community support tier (which provides access to our public knowledge base and forums) is included when the total subscription cost is less than $300. Once the total subscription cost reaches or exceeds $300, the Direct Help Desk tier is automatically unlocked, providing ticketed access to our expert team. Alternatively, the Direct Help Desk tier can be accessed immediately by purchasing the Priority Help Desk add-on, regardless of the subscription\'s total monthly cost.</p>' },
      { q:'Do you offer 24/7 support?',
        a:'<p>Yes, we can provide 24/7 support as part of our managed services with an additional signed SLA. Please <a href="https://thingsboard.io/contact-us/?subject=TBMQ" target="_blank" rel="noopener">contact us</a> for more details.</p>' },
      { q:'How can I get help with installation and setup?',
        a:'<p>If your subscription includes response time support and you have access to the Support Portal, the TBMQ support team can assist with system deployment as part of the subscription. However, this applies only if you follow recommended installation methods and architecture. Custom installation scripts or non-recommended deployment scenarios are not covered under included support. If your subscription plan does not include support, then we recommend using our documentation, tutorials, and optional professional services. To discuss options, please <a href="https://thingsboard.io/contact-us/?subject=TBMQ" target="_blank" rel="noopener">contact us</a>.</p>' },
      { q:'How do I contact support?',
        a:'<p>The method for contacting support depends on your current license tier. If you are using the Community support tier, support is provided via self-service resources, including our comprehensive public documentation, knowledge base, and peer-to-peer forums. If you have the Direct Help Desk or Priority Help Desk tier (which is included when your subscription cost is over $300 or purchased as an add-on), you will access support through our dedicated ticketed system via the <a href="https://thingsboard-portal.atlassian.net/servicedesk/customer/portal/1" target="_blank" rel="noopener">Support portal</a>, where requests are managed directly by our TBMQ expert team.</p>' },
      { q:'What issues are included in subscription support?',
        a:'<p>Access to our dedicated Support Portal is included with the Direct Help Desk and Priority Help Desk support tiers, as well as for Perpetual license holders. The support service includes expert assistance with platform installation and migration for default deployments, along with resolving any questions related to the platform\'s out-of-the-box functionalities, as detailed in our documentation. All support inquiries are managed through a single queue, and our commitment is to provide an initial response within 24 hours to address your needs promptly. For specialized services such as custom consulting, code reviews, health assessments, or bespoke development projects, tailored solutions are available; our support engineers will efficiently guide you to the best resources if a request falls outside the standard platform scope.</p>' }
    ] }
    ]
  }
};

/* ---------- the block ---------------------------------------------------------
   `renderFAQ(host, product)` owns the whole node. Both hosts call it from the same
   render function that redraws their heading and their cards, so switching product
   changes the answers in the same frame it changes the prices. */
function faqSet(product){ return FAQ_CONTENT[product] || FAQ_CONTENT.thingsboard; }

/* The list is built ONCE per category with every answer in it, and the cap is a class
   on the container — `.capped` hides the seventh item onward in CSS. `Load more` then
   drops one class instead of re-rendering, so answers already open stay open, which
   re-rendering would have closed. */
function faqListHTML(cat){
  return cat.items.map(function(it, i){
    return '<div class="faq-i">'
      + '<h3 class="faq-qh">'
      +   '<button type="button" class="faq-q" aria-expanded="false">'
      +     '<span>' + esc(it.q) + '</span>'
      +     icon('chevron-down', { cls:'faq-chev' })
      +   '</button>'
      + '</h3>'
      /* the answer is the site's own markup, so it goes in as markup — the only
         unescaped copy in this prototype, and the header says where it came from */
      + '<div class="faq-a" hidden>' + it.a + '</div>'
      + '</div>';
  }).join('');
}

function renderFAQ(host, product){
  if(!host) return;
  var set = faqSet(product), cur = 0;

  host.innerHTML = '<h2 class="faq-h">' + esc(set.title) + '</h2>'
    + '<div class="faq-grid">'
    +   '<div class="faq-rail" role="tablist" aria-label="FAQ categories">'
    +     set.cats.map(function(c, i){
            return '<button type="button" class="faq-cat' + (i ? '' : ' on') + '" role="tab"'
              + ' aria-selected="' + (i ? 'false' : 'true') + '" data-faqcat="' + i + '">'
              + esc(c.label) + '</button>';
          }).join('')
    +   '</div>'
    +   '<div class="faq-panel" role="tabpanel">'
    +     '<div class="faq-list"></div>'
    +     '<button type="button" class="faq-more">Load more FAQ</button>'
    +   '</div>'
    + '</div>';

  var list = host.querySelector('.faq-list'), more = host.querySelector('.faq-more');

  function draw(i){
    cur = i;
    var cat = set.cats[i];
    list.innerHTML = faqListHTML(cat);
    /* the cap and the button are the same fact: a category of six or fewer has
       nothing to reveal, so it gets neither */
    var over = cat.items.length > FAQ_SHOWN;
    list.classList.toggle('capped', over);
    more.hidden = !over;
    host.querySelectorAll('.faq-cat').forEach(function(b, n){
      b.classList.toggle('on', n === i);
      b.setAttribute('aria-selected', n === i ? 'true' : 'false');
    });
  }
  draw(0);

  /* one listener for the whole block: the rail, the questions and Load more are all
     re-rendered under it, so nothing may be bound to a node directly */
  host.addEventListener('click', function(e){
    var cat = e.target.closest('.faq-cat');
    if(cat){ draw(+cat.dataset.faqcat); return; }
    if(e.target.closest('.faq-more')){ list.classList.remove('capped'); more.hidden = true; return; }
    var q = e.target.closest('.faq-q');
    if(q){
      var open = q.getAttribute('aria-expanded') === 'true';
      q.setAttribute('aria-expanded', open ? 'false' : 'true');
      q.parentElement.nextElementSibling.hidden = open;
    }
  });
}
