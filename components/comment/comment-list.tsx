import { SafeComment } from '@/lib/types';
import { CommentCard } from './comment-card';

export function CommentList({ comments }: { comments: SafeComment[] }) {
    return (
        <div className="space-y-6">
            {comments.map((comment, index) => (
                <div
                    key={comment.id}
                    className="animate-in fade-in slide-in-from-top-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <CommentCard comment={comment} />
                </div>
            ))}
        </div>
    );
}
