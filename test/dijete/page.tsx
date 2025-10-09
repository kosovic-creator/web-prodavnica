'use client';
interface ChildProps {
    value: string;
    onChange: (val: string) => void;
}
const Child = ({ value, onChange }: ChildProps) => (
    <input value={value} onChange={e => onChange(e.target.value)} />
);
export default Child;
