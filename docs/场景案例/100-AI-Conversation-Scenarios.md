# CJ Dropshipping MCP — 100 AI Conversation Scenario Cases

> This document contains 100 real-world conversation scenarios between users and AI assistants (GitHub Copilot / ChatGPT), covering all functional domains: product search, order management, logistics tracking, dispute handling, and more. Each case provides a natural English prompt and the expected tool chain, helping users quickly learn how to operate CJ Dropshipping through natural language.

---

## Table of Contents

- [🔐 Authentication & Login (01–08)](#authentication--login)
- [🔍 Product Search & Browse (09–22)](#product-search--browse)
- [📦 Product Details & Variants (23–30)](#product-details--variants)
- [🏪 Inventory Queries (31–37)](#inventory-queries)
- [🚚 Logistics & Freight (38–48)](#logistics--freight)
- [🛒 Order Creation & Cart (49–60)](#order-creation--cart)
- [📋 Order Queries & Management (61–70)](#order-queries--management)
- [💰 Payments & Balance (71–76)](#payments--balance)
- [🛡️ Dispute Handling (77–84)](#dispute-handling)
- [🏬 Shops & Product Connections (85–92)](#shops--product-connections)
- [⚙️ Webhook Configuration (93–95)](#webhook-configuration)
- [🔗 End-to-End Workflows (96–100)](#end-to-end-workflows)

---

## Authentication & Login

### Case 01 — First-time Login

**Prompt:**
> Help me log in to my CJ account

**Tools:** `show_login_form`
**Notes:** AI opens the CJ login page. The user enters their credentials directly in the UI, and the session token is automatically persisted to a local `.cj-token` file.

---

### Case 02 — Check Login Status

**Prompt:**
> Am I currently logged in to CJ?

**Tools:** `check_login_status`
**Notes:** AI validates the current session token and returns login status, account name, and token expiry information.

---

### Case 03 — Verify API Key Credentials

**Prompt:**
> Verify my CJ API credentials — my accessKey is xxxxxxxx and my secretKey is yyyyyyyy

**Tools:** `verify_credentials`
**Notes:** Used in remote mode (e.g., ChatGPT). Exchanges the API Key pair for an Access Token without requiring a UI login flow.

---

### Case 04 — Log Out

**Prompt:**
> Please log me out of CJ

**Tools:** `logout`
**Notes:** Clears the local session token. The user will need to log in again on their next session.

---

### Case 05 — Wait for Login to Complete

**Prompt:**
> I've filled in the login form, please wait for me to finish logging in

**Tools:** `wait_for_login`
**Notes:** AI enters a polling state, waiting for the login to succeed before automatically continuing with any queued operations.

---

### Case 06 — Get OAuth Authorization URL

**Prompt:**
> Get the CJ OAuth authorization URL so I can authorize on a third-party platform

**Tools:** `get_authorize_url`
**Notes:** Returns an OAuth 2.0 authorization link for integrating CJ account authorization into third-party systems.

---

### Case 07 — Re-login After Session Expiry

**Prompt:**
> I just got a "session expired" error, please help me log in again

**Tools:** `show_login_form`
**Notes:** When an `AuthExpiredError` is detected, AI automatically guides the user through a fresh login flow to restore the session.

---

### Case 08 — View Account Settings

**Prompt:**
> Show me my CJ account settings

**Tools:** `get_account_settings`
**Notes:** Returns account profile information including username, email, account tier, and feature permissions.

---

## Product Search & Browse

### Case 09 — Keyword Product Search

**Prompt:**
> Search for "wireless bluetooth earbuds" on CJ and show me the results

**Tools:** `search_products` → `show_product_list`
**Notes:** Fetches search result data first, then renders a visual product card list in the UI.

---

### Case 10 — Search with Specific Page Size

**Prompt:**
> Search for "phone case" and show the first 20 results

**Tools:** `search_products` (pageSize=20) → `show_product_list`
**Notes:** Supports both Chinese and English keywords. Results are presented in card format.

---

### Case 11 — Filter by Price Range

**Prompt:**
> Find phone holders priced between $5 and $20

**Tools:** `search_products` (keyword="phone holder", minPrice=5, maxPrice=20) → `show_product_list`
**Notes:** Price range filtering helps quickly identify products within target cost brackets.

---

### Case 12 — Search US Warehouse Products

**Prompt:**
> Find yoga mats available in the US warehouse for fast domestic shipping

**Tools:** `search_products` (keyword="yoga mat", isWarehouse=true, countryCode=US) → `show_product_list`
**Notes:** Global warehouse products ship locally, drastically reducing delivery times to the destination country.

---

### Case 13 — Search Free-Shipping Products

**Prompt:**
> Look for LED strip lights that include free shipping

**Tools:** `search_products` (keyword="LED strip", addMarkStatus=1) → `show_product_list`
**Notes:** `addMarkStatus=1` filters for free-shipping products, reducing total landed cost.

---

### Case 14 — Browse by Category

**Prompt:**
> Get the CJ product category tree first, then search for products in the Electronics category

**Tools:** `get_category_tree` → `search_products` (categoryId=...) → `show_product_list`
**Notes:** Fetching the category ID before searching improves relevance and narrows results accurately.

---

### Case 15 — Browse Trending Products

**Prompt:**
> Show me the currently trending / hot-selling products on CJ

**Tools:** `search_products` (productFlag=0) → `show_product_list`
**Notes:** `productFlag=0` corresponds to the "hot-selling" tag, returning products from the current best-seller list.

---

### Case 16 — Search New Arrivals

**Prompt:**
> Show me the newest home goods products recently listed on CJ

**Tools:** `get_category_tree` → `search_products` (productFlag=1, categoryId=home category ID) → `show_product_list`
**Notes:** New arrivals often receive extra platform traffic support, making early listing advantageous.

---

### Case 17 — Sort by Price Ascending

**Prompt:**
> Search for Bluetooth speakers, sorted by price from low to high

**Tools:** `search_products` (keyword="bluetooth speaker", orderBy=2, sort="asc") → `show_product_list`
**Notes:** Multiple sorting options are supported, making it easy to compare prices across products.

---

### Case 18 — Paginate to Next Page

**Prompt:**
> Show me the next page of search results

**Tools:** `search_products` (pageNum=2) → `show_product_list`
**Notes:** AI automatically increments the page number parameter when the user asks for more results.

---

### Case 19 — Search Germany Warehouse Products

**Prompt:**
> Find coffee machines in the Germany warehouse for shipping to Europe

**Tools:** `search_products` (keyword="coffee machine", isWarehouse=true, countryCode=DE) → `show_product_list`
**Notes:** The Germany warehouse covers most of Europe, making it ideal for EU market sellers.

---

### Case 20 — Search Products with Video

**Prompt:**
> Find makeup brush products that include a product video

**Tools:** `search_products` (keyword="makeup brush", productType=10) → `show_product_list`
**Notes:** Video products typically convert better on independent stores and social media platforms.

---

### Case 21 — Filter by Minimum Stock

**Prompt:**
> Find portable chargers with at least 1,000 units in stock

**Tools:** `search_products` (keyword="portable charger", startWarehouseInventory=1000) → `show_product_list`
**Notes:** Ensures sufficient inventory to avoid stockouts impacting fulfillment reliability.

---

### Case 22 — Search China Warehouse Products

**Prompt:**
> Search for toys in the China warehouse to ship to Australia

**Tools:** `search_products` (keyword="toy", isWarehouse=true, countryCode=CN) → `show_product_list`
**Notes:** China warehouse offers an extensive product catalog, suitable for deep-dive category selling.

---

## Product Details & Variants

### Case 23 — View Product Details

**Prompt:**
> Show me the full details for product ID 123456

**Tools:** `get_product_detail` → `show_product_detail`
**Notes:** Returns complete product information including description, images, specifications, weight, and dimensions.

---

### Case 24 — Read Product Reviews

**Prompt:**
> Show me buyer reviews for product ID AAABBB001

**Tools:** `get_product_reviews`
**Notes:** View real buyer feedback to assess product quality and gauge potential customer complaint risk.

---

### Case 25 — Query Product Variants

**Prompt:**
> What colors and sizes are available for product XYZ789?

**Tools:** `get_product_variants`
**Notes:** Returns all SKU variants with color, size, variant ID (vid), and pricing information.

---

### Case 26 — Look Up Variant by SKU

**Prompt:**
> Look up the details for SKU code CJSK12345678

**Tools:** `query_sku_detail_by_sku`
**Notes:** Directly query variant details by SKU code, ideal for bulk lookups from an existing SKU list.

---

### Case 27 — Paginate Through SKUs

**Prompt:**
> Paginate through all SKUs for product PROD001, returning 50 per page

**Tools:** `query_sku_detail_page`
**Notes:** Useful when a product has a very large number of variants, allowing batch retrieval of all SKU data.

---

### Case 28 — Batch Query SKU Details

**Prompt:**
> Batch query the details for these SKUs: CJSK001, CJSK002, CJSK003

**Tools:** `query_sku_details`
**Notes:** Queries multiple SKUs in a single call, reducing total API round-trips and improving efficiency.

---

### Case 29 — Query Product COGS

**Prompt:**
> Get the cost of goods sold (COGS) for variant IDs V001 and V002

**Tools:** `query_cogs`
**Notes:** Retrieves the actual procurement cost for accurate margin calculations and pricing strategy.

---

### Case 30 — Submit a Sourcing Request

**Prompt:**
> I found a product on 1688 that CJ doesn't carry yet. Please submit a sourcing request for me

**Tools:** `create_sourcing`
**Notes:** CJ's professional sourcing team evaluates the request and works to add the product to the platform catalog.

---

## Inventory Queries

### Case 31 — Check CJ Platform Inventory

**Prompt:**
> Check the current CJ platform inventory level for variant ID V12345

**Tools:** `query_cj_inventory`
**Notes:** Returns the real-time available stock quantity for the specified variant in CJ warehouses.

---

### Case 32 — Query Private Inventory

**Prompt:**
> Show my private (self-stocked) inventory, filtered to the US warehouse

**Tools:** `get_warehouses` → `query_private_inventory` (countryCode=US)
**Notes:** Private inventory refers to goods the user has personally purchased and stored in a CJ warehouse.

---

### Case 33 — Check Inventory Distribution Across Warehouses

**Prompt:**
> Show me the inventory breakdown across all warehouses for product PROD_ABC

**Tools:** `get_product_inventory`
**Notes:** Returns inventory quantities per warehouse globally, supporting multi-warehouse stocking decisions.

---

### Case 34 — View My Product List

**Prompt:**
> Show me a list of my products on the CJ platform

**Tools:** `get_my_products`
**Notes:** Displays the user's sourced/stocked product catalog with inventory status and product condition.

---

### Case 35 — Check Sourcing Request Progress

**Prompt:**
> I submitted a sourcing request earlier, please check on the progress

**Tools:** `query_sourcing`
**Notes:** Tracks the real-time progress and outcome from CJ's sourcing team.

---

### Case 36 — Get Global Warehouse List

**Prompt:**
> What warehouses does CJ have globally? Please list all locations

**Tools:** `get_warehouses`
**Notes:** Returns CJ's full global warehouse list with country codes and warehouse IDs.

---

### Case 37 — Check Storage Usage

**Prompt:**
> Check my current storage usage in CJ's warehouse

**Tools:** `get_storage_info`
**Notes:** Returns storage capacity and current utilization, useful for warehouse cost management.

---

## Logistics & Freight

### Case 38 — Calculate Shipping Cost

**Prompt:**
> Calculate the shipping cost for sending 2 units of variant V001 from China to the US

**Tools:** `calculate_freight` (startCountryCode=CN, endCountryCode=US, products=[{vid:"V001", quantity:2}])
**Notes:** Returns all available shipping methods with corresponding costs for comparison and selection.

---

### Case 39 — Compare Shipping Options

**Prompt:**
> I want to ship a phone case from China to the UK. What shipping methods are available and what do they cost?

**Tools:** `calculate_freight` (startCountryCode=CN, endCountryCode=GB)
**Notes:** Lists all available carriers (e.g., CJPacket, CJ International, ePacket) with a price comparison.

---

### Case 40 — Check Delivery Timeframes

**Prompt:**
> How long does shipping from China to Germany typically take?

**Tools:** `get_logistics_timeliness` (startCountryCode=CN, endCountryCode=DE)
**Notes:** Returns estimated delivery days per shipping method, helping users choose the right logistics channel.

---

### Case 41 — Track a Package

**Prompt:**
> Track the shipment with tracking number CJPKL7160102171YQ

**Tools:** `get_tracking_info` (trackNumbers=["CJPKL7160102171YQ"])
**Notes:** Returns real-time logistics events including current location, status, and estimated delivery date.

---

### Case 42 — Batch Track Multiple Packages

**Prompt:**
> Check the status of these three tracking numbers at once: CJXXX001, CJXXX002, CJXXX003

**Tools:** `get_tracking_info` (trackNumbers=["CJXXX001","CJXXX002","CJXXX003"])
**Notes:** Batch queries reduce the time spent waiting for multiple sequential API calls.

---

### Case 43 — Track Package from Order Number

**Prompt:**
> Where is the package for order CJ202500001 right now?

**Tools:** `get_order_detail` (extract trackNumber) → `get_tracking_info`
**Notes:** First retrieves the tracking number from the order details, then queries the real-time location.

---

### Case 44 — Calculate Freight with Platform Filter

**Prompt:**
> Calculate freight from China to the US, filtering for Shopify-compatible shipping methods only

**Tools:** `calculate_freight_tip` (srcAreaCode=CN, destAreaCode=US, platform=Shopify)
**Notes:** Returns only shipping options compatible with the Shopify platform for easier store configuration.

---

### Case 45 — Evaluate Shipping Costs to Australia

**Prompt:**
> I want to ship to Australia — what shipping methods are available and what are the estimated times and costs?

**Tools:** `get_logistics_timeliness` (endCountryCode=AU) → `calculate_freight` (endCountryCode=AU)
**Notes:** Combines timeliness and cost queries for a comprehensive assessment of the target market's logistics.

---

### Case 46 — Confirm Package Delivery

**Prompt:**
> Check whether tracking number CJXXX123 has been delivered and signed for

**Tools:** `get_tracking_info`
**Notes:** Confirms delivery status, used for procurement confirmation and post-sale service decisions.

---

### Case 47 — Calculate Freight for Heavy Items

**Prompt:**
> Calculate the shipping cost for 5 heavy dumbbells (vid=V_DUMBBELL) to Canada

**Tools:** `calculate_freight` (endCountryCode=CA, products=[{vid:"V_DUMBBELL", quantity:5}])
**Notes:** Heavy items have large freight cost variances; pre-calculating avoids unexpected cost overruns.

---

### Case 48 — Find the Cheapest Shipping Option

**Prompt:**
> What's the cheapest way to ship a small item from China to France?

**Tools:** `calculate_freight` (startCountryCode=CN, endCountryCode=FR)
**Notes:** After returning all options, AI automatically compares prices and recommends the lowest-cost method.

---

## Order Creation & Cart

### Case 49 — Create a Full Order

**Prompt:**
> Create an order for John Smith at 123 Main St, New York, NY 10001, phone +1-212-555-0100, shipping 1 unit of variant V_CASE via CJPacket

**Tools:** `create_order`
**Notes:** Creates the order in one step. AI populates all required fields and returns the order ID and payment link.

---

### Case 50 — Add Item to Cart

**Prompt:**
> Add 2 units of the earphones with variant ID V_EARPHONE to my shopping cart

**Tools:** `add_to_cart` (vid="V_EARPHONE", quantity=2)
**Notes:** Adds products to the cart for consolidated checkout and payment.

---

### Case 51 — Submit Order to Cart and Generate Payment

**Prompt:**
> My order ID is ORD123456 — please submit it to the cart and generate a payment order

**Tools:** `submit_order_to_cart` (orderId="ORD123456")
**Notes:** Automatically runs: add to cart → confirm cart → generate payment order, returning the payment link.

---

### Case 52 — Confirm Cart and Generate Payment Link

**Prompt:**
> My order ORD789 is already in the cart, please confirm it and generate a payment link

**Tools:** `confirm_cart_and_pay` (orderId="ORD789")
**Notes:** Skips the add-to-cart step and starts directly from cart confirmation, generating the final payment link.

---

### Case 53 — Open Shopping Cart Page

**Prompt:**
> Open my shopping cart page so I can review the items in it

**Tools:** `open_shopping_cart`
**Notes:** Opens the cart in the UI, allowing the user to visually review and manage cart contents.

---

### Case 54 — Merge Multiple Orders

**Prompt:**
> Merge orders ORD001, ORD002, and ORD003 to save on shipping costs

**Tools:** `merge_orders` (orderIds=["ORD001","ORD002","ORD003"])
**Notes:** Merging orders with the same delivery address means paying shipping only once, reducing total cost.

---

### Case 55 — Check Merge Progress

**Prompt:**
> Check the progress of the merge operation with merge ID MERGE_123

**Tools:** `get_merge_progress`
**Notes:** Order merging is an async operation. This tool polls for progress and final merge results.

---

### Case 56 — Delete an Order

**Prompt:**
> Please delete order ORD_DELETE_001 — I no longer need it

**Tools:** `delete_order`
**Notes:** ⚠️ Sensitive operation. AI will require user confirmation before executing to prevent accidental deletion.

---

### Case 57 — Confirm Order Receipt

**Prompt:**
> Confirm that order ORD_CONFIRM_001 has been received

**Tools:** `confirm_order`
**Notes:** Buyer confirmation of receipt closes the transaction and triggers the final settlement process.

---

### Case 58 — End-to-End: Search to Place Order

**Prompt:**
> Search for Bluetooth earbuds, pick a reasonably priced one, calculate shipping to the US, then place an order

**Tools:** `search_products` → `get_product_variants` → `calculate_freight` → `create_order`
**Notes:** Complete source-to-order flow. AI chains multiple tools to automatically complete the entire process.

---

### Case 59 — Batch Add Multiple Items to Cart

**Prompt:**
> Add the following to my cart: 3× V_ITEM1, 1× V_ITEM2, 2× V_ITEM3

**Tools:** Multiple `add_to_cart` calls
**Notes:** Batch adding multiple products for unified checkout saves time on repetitive operations.

---

### Case 60 — Open Order Placement Page

**Prompt:**
> Open the CJ order placement page

**Tools:** `open_order_page`
**Notes:** Opens the visual order entry interface, where users can manually fill in order details.

---

## Order Queries & Management

### Case 61 — View Order List

**Prompt:**
> Show me my recent order list

**Tools:** `get_order_list` → `show_order_list`
**Notes:** Retrieves order data and presents it in a visual list UI with status filtering and pagination.

---

### Case 62 — View Unpaid Orders

**Prompt:**
> Which of my orders are still waiting for payment?

**Tools:** `get_pay_order_list`
**Notes:** Queries specifically for orders in a pending-payment status for batch payment processing.

---

### Case 63 — View Order Details

**Prompt:**
> Get the full details for order CJ20250001

**Tools:** `get_order_detail` → `show_order_detail`
**Notes:** Returns complete order information: products, delivery address, logistics status, tracking number, etc.

---

### Case 64 — Filter Orders by Status

**Prompt:**
> Show me all orders that are currently in "shipped" status

**Tools:** `get_order_list` (orderStatus=shipped) → `show_order_list`
**Notes:** Status filtering helps focus on orders at a specific stage for faster operational processing.

---

### Case 65 — Query Orders by Date Range

**Prompt:**
> Get all orders placed between May 1 and May 31, 2025

**Tools:** `get_order_list` (dateFrom=2025-05-01, dateTo=2025-05-31) → `show_order_list`
**Notes:** Date-range queries support monthly reconciliation and data analysis workflows.

---

### Case 66 — View Order Details in Visual UI

**Prompt:**
> Show order ORD_VIS_001 details in a visual card interface

**Tools:** `get_order_detail` → `show_order_detail`
**Notes:** Card-style UI presentation is more intuitive and readable than plain text output.

---

### Case 67 — View Warehouse Outbound Photos

**Prompt:**
> Show me the warehouse outbound photos for order ORD_WH_001

**Tools:** `query_warehouse_order_pictures`
**Notes:** View photos taken during warehouse packing and dispatch for quality inspection or dispute evidence.

---

### Case 68 — Sort Products by Listing Count

**Prompt:**
> Search for hat products sorted by listing count from highest to lowest

**Tools:** `search_products` (keyword="hat", orderBy=1, sort="desc") → `show_product_list`
**Notes:** High-listing-count products are typically market-validated bestsellers worth investigating for your own store.

---

### Case 69 — Find Orders by Recipient Name

**Prompt:**
> Find all orders where the recipient name is "John Smith"

**Tools:** `get_order_list` (customerName="John Smith") → `show_order_list`
**Notes:** Filtering by recipient name quickly locates all orders associated with a specific customer.

---

### Case 70 — Open Order Management Page

**Prompt:**
> Open the CJ order management page

**Tools:** `open_order_page`
**Notes:** Directly navigates to CJ's order management interface for richer visual operations.

---

## Payments & Balance

### Case 71 — Check Account Balance

**Prompt:**
> How much balance do I currently have in my CJ account?

**Tools:** `get_account_balance`
**Notes:** Returns total balance, available balance, and any frozen amounts.

---

### Case 72 — Pay with Account Balance

**Prompt:**
> Pay for payment order PAY_ORD_001 using my CJ account balance

**Tools:** `pay_by_balance` (payOrderId="PAY_ORD_001")
**Notes:** ⚠️ Sensitive operation. AI will request user confirmation before executing the payment.

---

### Case 73 — Pay with Balance V2

**Prompt:**
> Use my balance to pay for these orders, the payId is PAYID_2025

**Tools:** `pay_by_balance_v2`
**Notes:** Updated payment API supporting batch payment across multiple orders for greater efficiency.

---

### Case 74 — Generate a Payment Link to Share

**Prompt:**
> The order is confirmed, but I don't want to pay directly right now — generate a payment link I can use later

**Tools:** `generate_payment_link`
**Notes:** Generates a shareable payment URL that can be forwarded to a purchasing team or paid through another channel.

---

### Case 75 — Check Freight Before Paying

**Prompt:**
> First calculate shipping for 3 units of V_WATCH from China to Japan. If the cost is acceptable, I'll pay

**Tools:** `calculate_freight` (endCountryCode=JP) → user confirms → `create_order` → `submit_order_to_cart`
**Notes:** Checking costs before committing avoids placing orders with unexpectedly high shipping fees.

---

### Case 76 — Summarize Unpaid Order Amounts

**Prompt:**
> How many unpaid orders do I currently have and what is the total amount due?

**Tools:** `get_pay_order_list`
**Notes:** Summarizes unpaid order data to support cash flow planning and batch payment scheduling.

---

## Dispute Handling

### Case 77 — Get Disputable Items in an Order

**Prompt:**
> I received a damaged item in order CJ_ORD_001 — check which items are eligible for a dispute

**Tools:** `get_dispute_products` (orderId="CJ_ORD_001")
**Notes:** Step 1 of the dispute process. Returns a list of disputable items with their `lineItemId` values.

---

### Case 78 — Confirm Dispute Options

**Prompt:**
> What dispute reasons and refund options are available for lineItemId LINE_001 in order CJ_ORD_001?

**Tools:** `confirm_dispute` (orderId="CJ_ORD_001", productInfoList=[{lineItemId:"LINE_001", quantity:1}])
**Notes:** Step 2. Returns the reason list, expect-result options (1=Refund, 2=Reissue), and the maximum refund amount. This is read-only — no changes are made yet.

---

### Case 79 — File a Refund Dispute

**Prompt:**
> The item in order CJ_ORD_001 arrived broken. Please file a dispute and request a full refund

**Tools:** `get_dispute_products` → `confirm_dispute` → `create_dispute` (expectType=1)
**Notes:** ⚠️ Sensitive operation. Full three-step process: get items → get options → submit dispute.

---

### Case 80 — File a Reissue Dispute

**Prompt:**
> My package has been stuck "in transit" for way too long. Please file a dispute to request a reshipment

**Tools:** `get_dispute_products` → `confirm_dispute` → `create_dispute` (expectType=2)
**Notes:** `expectType=2` requests a reshipment (Reissue) rather than a monetary refund.

---

### Case 81 — View All Disputes

**Prompt:**
> Show me all of my dispute records

**Tools:** `list_disputes`
**Notes:** Returns a complete list of all disputes with status, submission date, and processing progress.

---

### Case 82 — View Dispute Details

**Prompt:**
> Check the full details and current processing stage of dispute DISPUTE_001

**Tools:** `get_dispute_detail` (disputeId="DISPUTE_001")
**Notes:** Displays dispute handling progress, CJ's response, and the current proposed resolution.

---

### Case 83 — Cancel a Dispute

**Prompt:**
> I've reached an agreement with CJ — please cancel dispute DISPUTE_002

**Tools:** `cancel_dispute` (disputeId="DISPUTE_002")
**Notes:** Proactively withdrawing a resolved dispute maintains a positive relationship with CJ.

---

### Case 84 — Dispute with Balance Refund

**Prompt:**
> File a dispute for order CJ_ORD_REF for a damaged product — I want the refund credited to my CJ balance

**Tools:** `get_dispute_products` → `confirm_dispute` → `create_dispute` (expectType=1, refundType=1)
**Notes:** `refundType=1` credits the refund to the CJ account balance, which can be used immediately on future orders — faster than a platform reversal.

---

## Shops & Product Connections

### Case 85 — View Connected Shops

**Prompt:**
> Show me all the stores connected to my CJ account

**Tools:** `list_shops`
**Notes:** Returns all linked stores (Shopify, WooCommerce, etc.) with their connection status.

---

### Case 86 — View Product Connection Mappings

**Prompt:**
> Show me the product connection mappings between CJ and my Shopify store

**Tools:** `list_product_connections`
**Notes:** Displays the association map between CJ products and store-side products for synchronized management.

---

### Case 87 — Create a Product Connection

**Prompt:**
> Connect CJ product CJ_PROD_001 with Shopify product SHOP_PROD_001 in my store

**Tools:** `create_product_connection`
**Notes:** Once connected, CJ automatically syncs inventory and processes orders for that Shopify product.

---

### Case 88 — Disconnect a Product

**Prompt:**
> Remove the product connection for CJ product CJ_PROD_001

**Tools:** `disconnect_product`
**Notes:** ⚠️ Sensitive operation. After disconnecting, CJ will no longer auto-fulfill orders for that product. User confirmation required.

---

### Case 89 — List a Product to a Store

**Prompt:**
> List CJ product PROD_LIST_001 to my Shopify store

**Tools:** `save_product_to_shop`
**Notes:** Pushes CJ product content (title, description, images, price) directly to the linked store in one click.

---

### Case 90 — Open the Product Listing Page

**Prompt:**
> Open the product listing page so I can list a new product with more configuration options

**Tools:** `open_listing_page`
**Notes:** Navigates to CJ's visual listing interface, which supports advanced listing configuration options.

---

### Case 91 — Open the Product Connect Page

**Prompt:**
> Open the product connect page so I can manually manage product connections

**Tools:** `open_product_connect_page`
**Notes:** Provides a UI for managing CJ-to-store product links, supporting bulk operations.

---

### Case 92 — Image-Based Product Search

**Prompt:**
> I have a product image — please find visually similar products on CJ

**Tools:** `search_products_by_image`
**Notes:** AI analyzes the uploaded image's visual features and searches CJ's catalog for matching products.

---

## Webhook Configuration

### Case 93 — Set Up a Webhook

**Prompt:**
> Configure a webhook to notify my system at https://my-app.com/webhook whenever an order status changes

**Tools:** `configure_webhook`
**Notes:** Sets up CJ event push notifications. When order or logistics status changes, CJ automatically POSTs to the specified URL, enabling system automation.

---

### Case 94 — Update Webhook URL

**Prompt:**
> My server address changed — please update the webhook URL to https://new-server.com/cj-hook

**Tools:** `configure_webhook` (update URL)
**Notes:** Updates the webhook endpoint so the new server correctly receives CJ push events going forward.

---

### Case 95 — Check API Rate Limit Status

**Prompt:**
> Check my current API call rate limit status

**Tools:** `get_rate_limit_status`
**Notes:** Returns remaining API quota and reset time, helping avoid throttling that would cause request failures.

---

## End-to-End Workflows

### Case 96 — Full Source-to-List Workflow

**Prompt:**
> Help me find a competitive Bluetooth earbud — check its details and reviews, calculate US shipping, then list it on my Shopify store

**Tools:** `search_products` → `get_product_detail` → `get_product_reviews` → `calculate_freight` → `save_product_to_shop`
**Notes:** End-to-end sourcing workflow. AI chains five tools to complete the full path from discovering a product to listing it for sale.

---

### Case 97 — Auto-Process an Incoming Customer Order

**Prompt:**
> I have a Shopify order from Emma Jones at 10 Baker Street, London W1U 6TN, +44-20-7946-0958, for 1x variant V_SCARF. Please calculate freight, create the order, and generate a payment link

**Tools:** `calculate_freight` → `create_order` → `submit_order_to_cart`
**Notes:** Simulates automated order fulfillment. AI selects the optimal shipping method, creates the CJ order, and returns a ready-to-pay link.

---

### Case 98 — Full After-Sale Dispute Workflow

**Prompt:**
> A buyer complained that order CJ_AFTER_001 doesn't match the description. Please check which items can be disputed, get the available reasons, file the dispute, and then monitor its status

**Tools:** `get_dispute_products` → `confirm_dispute` → `create_dispute` → `get_dispute_detail`
**Notes:** Complete after-sale handling chain that helps operations teams efficiently resolve buyer complaints and protect account health.

---

### Case 99 — Batch Order Data Analysis

**Prompt:**
> Get all orders from the last 30 days and analyze the order count, total revenue, and which product sold the most

**Tools:** `get_order_list` (paginated) → AI data analysis
**Notes:** After retrieving order data, AI automatically performs aggregate statistical analysis and outputs a business insight report.

---

### Case 100 — New Store Full Onboarding Guide

**Prompt:**
> I just opened a Shopify store and want to use CJ for dropshipping. Please: 1) Log me in to CJ; 2) Browse US warehouse products; 3) List one product to my store; 4) Set up an order webhook for automatic fulfillment

**Tools:** `show_login_form` → `search_products` (isWarehouse=true, countryCode=US) → `show_product_list` → `save_product_to_shop` → `configure_webhook`
**Notes:** Complete new-seller onboarding guide. AI acts as both a "smart product advisor" and "operations assistant," walking through the full platform setup step by step.

---

## Appendix: Tool Quick-Reference

| Domain | Tool Name | Description |
|---|---|---|
| Auth | `show_login_form` | Open login UI |
| Auth | `check_login_status` | Verify login state |
| Auth | `verify_credentials` | API Key authentication |
| Auth | `wait_for_login` | Wait for login completion |
| Auth | `logout` | Log out |
| Auth | `get_authorize_url` | Get OAuth authorization URL |
| Auth | `get_account_settings` | View account settings |
| Product | `search_products` | Search product catalog |
| Product | `show_product_list` | Render product card list UI |
| Product | `get_product_detail` | Fetch product details |
| Product | `show_product_detail` | Render product detail UI |
| Product | `get_product_variants` | Query product variants |
| Product | `get_product_reviews` | View buyer reviews |
| Product | `get_category_tree` | Get category tree |
| Product | `query_sku_detail_by_sku` | Query variant by SKU |
| Product | `query_sku_detail_page` | Paginate SKU query |
| Product | `query_sku_details` | Batch query SKUs |
| Product | `query_cogs` | Query cost of goods |
| Product | `create_sourcing` | Submit sourcing request |
| Product | `query_sourcing` | Check sourcing progress |
| Product | `search_products_by_image` | Image-based product search |
| Inventory | `get_warehouses` | Get warehouse list |
| Inventory | `query_cj_inventory` | Query CJ platform inventory |
| Inventory | `query_private_inventory` | Query private inventory |
| Inventory | `get_product_inventory` | Product inventory by warehouse |
| Inventory | `get_my_products` | My product list |
| Inventory | `get_storage_info` | Storage usage info |
| Logistics | `calculate_freight` | Calculate shipping cost |
| Logistics | `calculate_freight_tip` | Enhanced freight calculation |
| Logistics | `get_logistics_timeliness` | Query delivery timeframes |
| Logistics | `get_tracking_info` | Real-time package tracking |
| Order | `create_order` | Create an order |
| Order | `add_to_cart` | Add item to cart |
| Order | `submit_order_to_cart` | Submit order through cart |
| Order | `confirm_cart_and_pay` | Confirm cart and pay |
| Order | `generate_payment_link` | Generate payment link |
| Order | `merge_orders` | Merge orders |
| Order | `get_merge_progress` | Check merge progress |
| Order | `delete_order` | Delete an order |
| Order | `confirm_order` | Confirm receipt |
| Order | `get_order_list` | Get order list |
| Order | `show_order_list` | Render order list UI |
| Order | `get_order_detail` | Get order details |
| Order | `show_order_detail` | Render order detail UI |
| Order | `get_pay_order_list` | Unpaid orders |
| Order | `open_order_page` | Open order page |
| Order | `open_shopping_cart` | Open shopping cart |
| Order | `query_warehouse_order_pictures` | Warehouse outbound photos |
| Payment | `get_account_balance` | Check account balance |
| Payment | `pay_by_balance` | Pay with balance |
| Payment | `pay_by_balance_v2` | Pay with balance V2 |
| Dispute | `get_dispute_products` | Get disputable items |
| Dispute | `confirm_dispute` | Query dispute options |
| Dispute | `create_dispute` | File a dispute |
| Dispute | `list_disputes` | List all disputes |
| Dispute | `get_dispute_detail` | View dispute details |
| Dispute | `cancel_dispute` | Cancel a dispute |
| Shop | `list_shops` | List connected shops |
| Shop | `list_product_connections` | View product connections |
| Shop | `create_product_connection` | Create product connection |
| Shop | `disconnect_product` | Remove product connection |
| Shop | `save_product_to_shop` | List product to store |
| Shop | `open_listing_page` | Open listing page |
| Shop | `open_product_connect_page` | Open product connect page |
| Webhook | `configure_webhook` | Configure webhook |
| System | `get_rate_limit_status` | API rate limit status |
