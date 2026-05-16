# Security Specification - Nexus Project Suite

## 1. Data Invariants
- A `Task` must always belong to a valid `Project`.
- A `Project` owner must be a user with the `Admin` role or the creator of the project.
- `Members` can only see projects and tasks they are assigned to or are part of the project team.
- `Admin` has full CRUD access to all collections.
- `Member` role is restricted to updating task status and viewing assigned projects/tasks.

## 2. Invariant Guards
- `User` profile: Only the owner can update their own profile (except for role, which is system-assigned or admin-assigned).
- `Project`: Only Admin can create/delete. Members can view.
- `Task`: Admin can create/delete/update all fields. Assigned Member can only update `status`.

## 3. Boundary Payloads (The Dirty Dozen)
1. **Identity Theft**: Update another user's profile role from `Member` to `Admin`.
2. **Orphaned Task**: Create a task with a non-existent `projectId`.
3. **Privilege Escalation**: Member attempting to create a new Project.
4. **State Injection**: Updating a task with an invalid priority (e.g., "Critical").
5. **ID Poisoning**: Injecting a 2KB string as a Firestore document ID.
6. **Self-Assignment**: Member assigning themselves to a task they shouldn't see.
7. **Cross-Project Pollution**: Member listing tasks from a project they aren't part of.
8. **Shadow Fields**: Adding an `isVerified: true` field to a Task.
9. **Timestamp Spoofing**: Sending a client-side `createdAt` date from 2020.
10. **Data Scraping**: Authenticated user trying to `list` all users without permission.
11. **Resource Exhaustion**: Creating a Task with a 1MB description field.
12. **Owner Displacement**: Updating a Project's `ownerId` to yourself when you aren't the owner.

## 4. Test Logic (Simplified)
All write operations must be guarded by `isValid[Entity]()` which checks keys, types, and sizes.
Role-based access checks will use `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role`.
