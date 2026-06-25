import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Submission, SubmissionFields } from './types';
import { updateFacility } from './facilities';

const SUBMISSIONS_COLLECTION = 'submissions';

export async function createSubmission(
  facilityId: string,
  facilityName: string,
  fields: SubmissionFields,
  submitterName: string | null
): Promise<string> {
  const docRef = await addDoc(collection(db, SUBMISSIONS_COLLECTION), {
    facilityId,
    facilityName,
    fields,
    submitterName: submitterName || null,
    status: 'pending',
    createdAt: Timestamp.now(),
    reviewedAt: null,
  });
  return docRef.id;
}

export async function getPendingSubmissions(): Promise<Submission[]> {
  const q = query(
    collection(db, SUBMISSIONS_COLLECTION),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      facilityId: data.facilityId,
      facilityName: data.facilityName,
      fields: data.fields,
      submitterName: data.submitterName || null,
      status: data.status,
      createdAt:
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate()
          : new Date(),
      reviewedAt:
        data.reviewedAt instanceof Timestamp
          ? data.reviewedAt.toDate()
          : null,
    } as Submission;
  });
}

export async function approveSubmission(submission: Submission): Promise<void> {
  // Merge submitted fields into the facility document
  await updateFacility(submission.facilityId, submission.fields);

  // Update submission status
  const ref = doc(db, SUBMISSIONS_COLLECTION, submission.id);
  await updateDoc(ref, {
    status: 'approved',
    reviewedAt: Timestamp.now(),
  });
}

export async function rejectSubmission(submissionId: string): Promise<void> {
  const ref = doc(db, SUBMISSIONS_COLLECTION, submissionId);
  await updateDoc(ref, {
    status: 'rejected',
    reviewedAt: Timestamp.now(),
  });
}
