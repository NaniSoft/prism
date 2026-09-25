import { Button } from '@nanisoft/prism-ui/components/button';
import { Field, FieldDescription, FieldLabel } from '@nanisoft/prism-ui/components/field';
import { Input } from '@nanisoft/prism-ui/components/input';

export default function FieldDemo() {
  return (
    <form style={{ display: 'grid', width: 'min(100%, 360px)', gap: 16 }}>
      <Field>
        <FieldLabel>Project name</FieldLabel>
        <Input name="project" placeholder="Northstar" required />
        <FieldDescription>Used in project navigation and generated metadata.</FieldDescription>
      </Field>
      <Button variant="primary" type="submit">Create project</Button>
    </form>
  );
}
