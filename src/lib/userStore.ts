import { randomUUID } from "crypto";
import type { UserRole } from "@/lib/roles";
import { getMongoDb } from "@/lib/mongoDb";
import { userSeedData } from "@/lib/userSeed";

export interface UserRecord {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  roles?: UserRole[];
  department?: string;
  email?: string;
  firebaseUid?: string;
  phone?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  lastActiveAt?: string;
  [key: string]: any;
}

interface UserDocument extends Omit<UserRecord, "id"> {
  _id: string;
  id?: string;
}

interface CreateUserInput {
  id?: string;
  username?: string;
  email?: string;
  password?: string;
  name: string;
  role: UserRole;
  roles?: UserRole[];
  department?: string;
  firebaseUid?: string;
  phone?: string;
  status?: string;
  [key: string]: any;
}

let indexesEnsured = false;
let seedEnsured = false;

function normalizeIdentity(value: string) {
  return value.trim().toLowerCase();
}

function mapUserDocument(document: UserDocument): UserRecord {
  const { _id, id, ...rest } = document;
  return {
    ...rest,
    id: id || _id,
  } as UserRecord;
}

async function getUsersCollection() {
  const db = await getMongoDb();
  const collection = db.collection<UserDocument>("users");

  if (!indexesEnsured) {
    indexesEnsured = true;
    try {
      await collection.createIndex({ username: 1 }, { unique: true });
    } catch {
      // ignore index creation conflicts
    }
  }

  if (!seedEnsured) {
    seedEnsured = true;
    const existingCount = await collection.countDocuments();
    if (existingCount === 0 && userSeedData.length > 0) {
      const seedDocuments = userSeedData.map((user) => {
        const normalizedIdentity = normalizeIdentity(
          user.username || user.email || "",
        );
        return {
          ...user,
          _id: user.id,
          id: user.id,
          username: normalizedIdentity,
          email: normalizeIdentity(user.email || normalizedIdentity),
          role: user.role,
          roles: user.roles || [user.role],
        } as UserDocument;
      });

      if (seedDocuments.length > 0) {
        await collection.insertMany(seedDocuments, { ordered: false });
      }
    }
  }

  return collection;
}

export async function getAllUsers() {
  const collection = await getUsersCollection();
  const users = await collection.find({}).toArray();
  return users.map(mapUserDocument);
}

export async function findUserByUsername(username: string) {
  const normalizedUsername = normalizeIdentity(username);
  const users = await getAllUsers();

  return (
    users.find(
      (user) =>
        normalizeIdentity(user.username || "") === normalizedUsername ||
        normalizeIdentity(user.email || "") === normalizedUsername,
    ) || null
  );
}

export async function findUserById(id: string) {
  const collection = await getUsersCollection();
  const user = await collection.findOne({ _id: id });
  return user ? mapUserDocument(user) : null;
}

export async function createUser(input: CreateUserInput) {
  const collection = await getUsersCollection();
  const identifier = input.username || input.email;

  if (!identifier) {
    throw new Error("Username or email is required");
  }

  const normalizedIdentity = normalizeIdentity(identifier);
  const existingUser = await findUserByUsername(normalizedIdentity);

  if (existingUser) {
    throw new Error("DUPLICATE_USER");
  }

  const timestamp = new Date().toISOString();
  const id = input.id || randomUUID();
  const role = input.role;
  const roles = input.roles || [role];

  const user: UserDocument = {
    ...(input as Omit<UserDocument, "_id">),
    _id: id,
    id,
    username: normalizedIdentity,
    email: normalizeIdentity(input.email || normalizedIdentity),
    role,
    roles,
    createdAt: input.createdAt || timestamp,
    updatedAt: input.updatedAt || timestamp,
  };

  if (!input.password) {
    delete user.password;
  }

  await collection.insertOne(user);

  return mapUserDocument(user);
}

export async function updateUserById(id: string, updates: Partial<UserRecord>) {
  const collection = await getUsersCollection();

  const payload: Partial<UserDocument> = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (payload.username) {
    payload.username = normalizeIdentity(payload.username);
  }

  if (payload.email) {
    payload.email = normalizeIdentity(payload.email);
  }

  delete payload._id;
  delete payload.id;

  await collection.updateOne({ _id: id }, { $set: payload });
  return findUserById(id);
}

export async function updateUserLastActive(id: string) {
  const collection = await getUsersCollection();
  const timestamp = new Date().toISOString();

  await collection.updateOne(
    { _id: id },
    {
      $set: {
        lastActiveAt: timestamp,
        updatedAt: timestamp,
      },
    },
  );
}

export async function deleteUserById(id: string) {
  const collection = await getUsersCollection();
  await collection.deleteOne({ _id: id });
}
