"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studySessionsRelations = exports.fileRelations = exports.tasksRelations = exports.usersRelations = exports.study_sessions = exports.file = exports.tasks = exports.users = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    clerk_user_id: (0, pg_core_1.text)("clerk_user_id").notNull().unique(),
    email: (0, pg_core_1.text)("email").default("").unique(),
    username: (0, pg_core_1.text)("username").notNull(),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow().notNull(),
    has_seen_tour: (0, pg_core_1.boolean)("has_seen_tour").default(false)
});
exports.tasks = (0, pg_core_1.pgTable)("tasks", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    user_id: (0, pg_core_1.uuid)("user_id").references(() => exports.users.id, { onDelete: "cascade" }),
    title: (0, pg_core_1.text)("title").notNull(),
    details: (0, pg_core_1.text)("details"),
    due: (0, pg_core_1.text)("due"),
    type: (0, pg_core_1.text)("type", { enum: ['Assignments', 'Tasks', 'Events'] }).default("Assignments"),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
    completed: (0, pg_core_1.boolean)("completed").default(false)
});
exports.file = (0, pg_core_1.pgTable)("file", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    filename: (0, pg_core_1.text)('filename'),
    upload_date: (0, pg_core_1.timestamp)("upload_date", { withTimezone: true }).defaultNow(),
    user_id: (0, pg_core_1.uuid)("user_id").references(() => exports.users.id, { onDelete: "cascade" }),
    path: (0, pg_core_1.text)('path'),
    file_hash: (0, pg_core_1.text)("file_hash").unique(),
    completed: (0, pg_core_1.boolean)("completed").default(false)
});
exports.study_sessions = (0, pg_core_1.pgTable)("study_sessions", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    user_id: (0, pg_core_1.uuid)("user_id").references(() => exports.users.id, { onDelete: "cascade" }),
    file_id: (0, pg_core_1.uuid)("file_id").references(() => exports.file.id, { onDelete: "cascade" }),
    mode: (0, pg_core_1.text)("mode", { enum: ['Feynman', 'Socratic', 'Quiz', 'Flashcards'] }).notNull(),
    topic: (0, pg_core_1.text)("topic").notNull(),
    score: (0, pg_core_1.integer)("score").notNull(),
    passed: (0, pg_core_1.boolean)("passed").default(false),
    feedback: (0, pg_core_1.text)("feedback").default("Finish to get feedback!"),
    wrong_index: (0, pg_core_1.integer)("wrong_index").array(), //reminder to myself: since payload is in the frontend, use this to grab the items the user got wrong
    payload: (0, pg_core_1.jsonb)("payload"),
    already_attempted: (0, pg_core_1.boolean)("already_attempted").default(false),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow()
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many }) => ({
    tasks: many(exports.tasks),
    files: many(exports.file),
    studySessions: many(exports.study_sessions)
}));
exports.tasksRelations = (0, drizzle_orm_1.relations)(exports.tasks, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.tasks.user_id],
        references: [exports.users.id]
    })
}));
exports.fileRelations = (0, drizzle_orm_1.relations)(exports.file, ({ one, many }) => ({
    user: one(exports.users, {
        fields: [exports.file.user_id],
        references: [exports.users.id]
    }),
    studySessions: many(exports.study_sessions)
}));
exports.studySessionsRelations = (0, drizzle_orm_1.relations)(exports.study_sessions, ({ one }) => ({
    user: one(exports.users, {
        fields: [exports.study_sessions.user_id],
        references: [exports.users.id]
    }),
    file: one(exports.file, {
        fields: [exports.study_sessions.file_id],
        references: [exports.file.id]
    })
}));
