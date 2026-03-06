import Array "mo:core/Array";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  module ProductCategory {
    public type Type = {
      #cleanser;
      #moisturizer;
      #serum;
      #sunscreen;
      #toner;
      #other;
    };
  };

  type ProductCategory = ProductCategory.Type;

  module Product {
    public type Type = {
      name : Text;
      category : ProductCategory;
      startDate : Time.Time;
      estimatedDays : Nat;
      purchasePrice : Float;
      notes : Text;
      isFinished : Bool;
    };

    public func compareByCategory(p1 : Type, p2 : Type) : Order.Order {
      Text.compare(p1.name, p2.name);
    };

    public func compareByName(p1 : Type, p2 : Type) : Order.Order {
      Text.compare(p1.name, p2.name);
    };
  };

  type Product = Product.Type;
  type ProductId = Nat;

  module ProductMap {
    public type State = {
      nextId : ProductId;
      products : Map.Map<ProductId, Product>;
    };

    public func initState() : State {
      {
        nextId = 1;
        products = Map.empty<ProductId, Product>();
      };
    };

    public func add(state : State, product : Product) : ProductId {
      let productId = state.nextId;
      state.products.add(productId, product);
      productId;
    };

    public func update(state : State, productId : ProductId, product : Product) {
      if (not state.products.containsKey(productId)) {
        Runtime.trap("Product does not exist");
      };
      state.products.add(productId, product);
    };

    public func remove(state : State, productId : ProductId) {
      if (not state.products.containsKey(productId)) {
        Runtime.trap("Product does not exist");
      };
      state.products.remove(productId);
    };
  };

  let userProductMaps = Map.empty<Principal, ProductMap.State>();

  func getUserProductMap(caller : Principal) : ProductMap.State {
    switch (userProductMaps.get(caller)) {
      case (null) {
        let newState = ProductMap.initState();
        userProductMaps.add(caller, newState);
        newState;
      };
      case (?state) { state };
    };
  };

  public shared ({ caller }) func addProduct(product : Product) : async ProductId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add products");
    };
    let productMap = getUserProductMap(caller);
    let productId = ProductMap.add(productMap, product);
    productId;
  };

  public query ({ caller }) func getProduct(productId : ProductId) : async Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view products");
    };
    let productMap = getUserProductMap(caller);
    switch (productMap.products.get(productId)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view products");
    };
    getUserProductMap(caller).products.values().toArray();
  };

  public shared ({ caller }) func updateProduct(productId : ProductId, product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update products");
    };
    ProductMap.update(getUserProductMap(caller), productId, product);
  };

  public shared ({ caller }) func deleteProduct(productId : ProductId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete products");
    };
    ProductMap.remove(getUserProductMap(caller), productId);
  };

  module Expense {
    public type Type = {
      productName : Text;
      amount : Float;
      category : ProductCategory;
      date : Time.Time;
      notes : Text;
    };

    public func compareByDate(e1 : Type, e2 : Type) : Order.Order {
      Int.compare(e1.date, e2.date);
    };

    public func compareByAmount(e1 : Type, e2 : Type) : Order.Order {
      Text.compare(e1.productName, e2.productName);
    };
  };

  type Expense = Expense.Type;
  type ExpenseId = Nat;

  module ExpenseMap {
    public type State = {
      nextId : ExpenseId;
      expenses : Map.Map<ExpenseId, Expense>;
    };

    public func initState() : State {
      {
        nextId = 1;
        expenses = Map.empty<ExpenseId, Expense>();
      };
    };

    public func add(state : State, expense : Expense) : ExpenseId {
      let expenseId = state.nextId;
      state.expenses.add(expenseId, expense);
      expenseId;
    };

    public func update(state : State, expenseId : ExpenseId, expense : Expense) {
      if (not state.expenses.containsKey(expenseId)) {
        Runtime.trap("Expense does not exist");
      };
      state.expenses.add(expenseId, expense);
    };

    public func remove(state : State, expenseId : ExpenseId) {
      if (not state.expenses.containsKey(expenseId)) {
        Runtime.trap("Expense does not exist");
      };
      state.expenses.remove(expenseId);
    };

    public func getTotalAmount(state : State) : Float {
      var total : Float = 0.0;
      for (expense in state.expenses.values()) {
        total += expense.amount;
      };
      total;
    };
  };

  let userExpenseMaps = Map.empty<Principal, ExpenseMap.State>();

  func getUserExpenseMap(caller : Principal) : ExpenseMap.State {
    switch (userExpenseMaps.get(caller)) {
      case (null) {
        let newState = ExpenseMap.initState();
        userExpenseMaps.add(caller, newState);
        newState;
      };
      case (?state) { state };
    };
  };

  public shared ({ caller }) func addExpense(expense : Expense) : async ExpenseId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add expenses");
    };
    ExpenseMap.add(getUserExpenseMap(caller), expense);
  };

  public query ({ caller }) func getExpense(expenseId : ExpenseId) : async Expense {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expenses");
    };
    switch (getUserExpenseMap(caller).expenses.get(expenseId)) {
      case (null) { Runtime.trap("Expense does not exist") };
      case (?expense) { expense };
    };
  };

  public query ({ caller }) func getAllExpenses() : async [Expense] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expenses");
    };
    getUserExpenseMap(caller).expenses.values().toArray();
  };

  public query ({ caller }) func getTotalExpenses() : async Float {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view expenses");
    };
    ExpenseMap.getTotalAmount(getUserExpenseMap(caller));
  };

  public shared ({ caller }) func updateExpense(expenseId : ExpenseId, expense : Expense) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update expenses");
    };
    ExpenseMap.update(getUserExpenseMap(caller), expenseId, expense);
  };

  public shared ({ caller }) func deleteExpense(expenseId : ExpenseId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete expenses");
    };
    ExpenseMap.remove(getUserExpenseMap(caller), expenseId);
  };

  module JourneyEntry {
    public type Type = {
      date : Time.Time;
      skinCondition : Text;
      hydrationLevel : Nat;
      breakoutsCount : Nat;
      overallRating : Nat;
      notes : Text;
    };

    public func compareByDate(j1 : Type, j2 : Type) : Order.Order {
      Int.compare(j2.date, j1.date);
    };
  };

  type JourneyEntry = JourneyEntry.Type;
  type JourneyEntryId = Nat;

  module JourneyEntryMap {
    public type State = {
      nextId : JourneyEntryId;
      entries : Map.Map<JourneyEntryId, JourneyEntry>;
    };

    public func initState() : State {
      {
        nextId = 1;
        entries = Map.empty<JourneyEntryId, JourneyEntry>();
      };
    };

    public func add(state : State, entry : JourneyEntry) : JourneyEntryId {
      let entryId = state.nextId;
      state.entries.add(entryId, entry);
      entryId;
    };

    public func update(state : State, entryId : JourneyEntryId, entry : JourneyEntry) {
      if (not state.entries.containsKey(entryId)) {
        Runtime.trap("JourneyEntry does not exist");
      };
      state.entries.add(entryId, entry);
    };

    public func remove(state : State, entryId : JourneyEntryId) {
      if (not state.entries.containsKey(entryId)) {
        Runtime.trap("JourneyEntry does not exist");
      };
      state.entries.remove(entryId);
    };
  };

  let userJourneyEntryMaps = Map.empty<Principal, JourneyEntryMap.State>();

  func getUserJourneyEntryMap(caller : Principal) : JourneyEntryMap.State {
    switch (userJourneyEntryMaps.get(caller)) {
      case (null) {
        let newState = JourneyEntryMap.initState();
        userJourneyEntryMaps.add(caller, newState);
        newState;
      };
      case (?state) { state };
    };
  };

  public shared ({ caller }) func addJourneyEntry(entry : JourneyEntry) : async JourneyEntryId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add journey entries");
    };
    JourneyEntryMap.add(getUserJourneyEntryMap(caller), entry);
  };

  public query ({ caller }) func getJourneyEntry(entryId : JourneyEntryId) : async JourneyEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view journey entries");
    };
    switch (getUserJourneyEntryMap(caller).entries.get(entryId)) {
      case (null) { Runtime.trap("Journey entry does not exist") };
      case (?entry) { entry };
    };
  };

  public query ({ caller }) func getAllJourneyEntries() : async [JourneyEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view journey entries");
    };
    getUserJourneyEntryMap(caller).entries.values().toArray();
  };

  public shared ({ caller }) func updateJourneyEntry(entryId : JourneyEntryId, entry : JourneyEntry) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update journey entries");
    };
    JourneyEntryMap.update(getUserJourneyEntryMap(caller), entryId, entry);
  };

  public shared ({ caller }) func deleteJourneyEntry(entryId : JourneyEntryId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete journey entries");
    };
    JourneyEntryMap.remove(getUserJourneyEntryMap(caller), entryId);
  };
};
