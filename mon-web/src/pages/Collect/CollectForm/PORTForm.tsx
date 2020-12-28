import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import _ from 'lodash';
import { Button, Form, Select, Input, InputNumber, TreeSelect } from 'antd';
import { renderTreeNodes } from '@pkgs/Layout/utils';
import useFormatMessage from '@pkgs/hooks/useFormatMessage';
import { nameRule, interval } from '../config';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
const defaultFormData = {
  collect_type: 'port',
  timeout: 3,
  step: 10,
};

const getInitialValues = (initialValues: any) => {
  return _.assignIn({}, defaultFormData, _.cloneDeep(initialValues));
}

const CollectForm = (props: any) => {
  const intlFmtMsg = useFormatMessage();
  const initialValues = getInitialValues(props.initialValues);
  const { getFieldProps, getFieldDecorator } = props.form;
  const service = _.chain(initialValues.tags).split(',').filter(item => item.indexOf('service=') === 0).head().split('service=').last().value();

  getFieldDecorator('collect_type', {
    initialValue: initialValues.collect_type,
  });

  const [submitLoading, setSubmitLoading] = useState(false);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    props.form.validateFields((errors: any, values: any) => {
      if (errors) {
        console.error(errors);
        return;
      }
      setSubmitLoading(true);
      const { service } = values;
      values.tags = `service=${service}`;
      delete values.service;
      props.onSubmit(values).catch(() => {
        setSubmitLoading(false);
      });
    });
  }

  return (
    <Form layout="horizontal" onSubmit={handleSubmit}>
      <FormItem
        {...formItemLayout}
        label={intlFmtMsg({ id: 'collect.port.title' })}
      >
        <span className="ant-form-text">proc.port.listen</span>
      </FormItem>
      <FormItem
        {...formItemLayout}
        label={intlFmtMsg({ id: 'collect.common.node' })}
      >
        {
          getFieldDecorator('nid', {
            initialValue: initialValues.nid,
            rules: [{ required: true, message: '请选择节点！' }],
          })(
            <TreeSelect
              style={{ width: 500 }}
              showSearch
              allowClear
              treeDefaultExpandAll
              treeNodeFilterProp="path"
              treeNodeLabelProp="path"
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
            >
              {renderTreeNodes(props.treeData, 'treeSelect')}
            </TreeSelect>,
          )
        }
      </FormItem>
      <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'collect.common.name' })}>
        <Input
          {...getFieldProps('name', {
            initialValue: initialValues.name,
            rules: [
              { required: true, message: '必填项！' },
              nameRule,
            ],
          })}
          size="default"
          style={{ width: 500 }}
          placeholder={intlFmtMsg({ id: 'collect.port.name.placeholder' })}
        />
      </FormItem>
      <FormItem {...formItemLayout} label="Service">
        <Input
          {...getFieldProps('service', {
            initialValue: service,
            rules: [
              { required: true , message: '必填项！'},
              { pattern: /^[a-zA-Z0-9-_.]+$/, message: '请输入英文小写、数字、下划线、点！' },
            ],
          })}
          size="default"
          style={{ width: 500 }}
        />
      </FormItem>
      <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'collect.port.port' })} required>
        <InputNumber
          {...getFieldProps('port', {
            initialValue: initialValues.port,
            rules: [
              { required: true, message: '必填项！' },
            ],
          })}
          size="default"
          style={{ width: 500 }}
        />
      </FormItem>
      <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'collect.port.timeout' })}>
        <InputNumber
          min={1}
          style={{ width: 100 }}
          size="default"
          {...getFieldProps('timeout', {
            initialValue: initialValues.timeout,
            rules: [
              { required: true },
            ],
          })}
        /> {intlFmtMsg({ id: 'collect.port.timeout.unit' })}
      </FormItem>
      <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'collect.common.step' })}>
        <Select
          size="default"
          style={{ width: 100 }}
          {...getFieldProps('step', {
            initialValue: initialValues.step,
            rules: [
              { required: true, message: '请选择！' },
            ],
          })}
        >
          {
            _.map(interval, item => <Option key={item} value={item}>{item}</Option>)
          }
        </Select> {intlFmtMsg({ id: 'collect.common.step.unit' })}
      </FormItem>
      <FormItem {...formItemLayout} label={intlFmtMsg({ id: 'collect.common.note' })}>
        <Input
          type="textarea"
          placeholder=""
          {...getFieldProps('comment', {
            initialValue: initialValues.comment,
          })}
          style={{ width: 500 }}
        />
      </FormItem>
      <FormItem wrapperCol={{ offset: 6 }} style={{ marginTop: 24 }}>
        <Button type="primary" htmlType="submit" loading={submitLoading}>{intlFmtMsg({ id: 'form.submit' })}</Button>
        <Button
          style={{ marginLeft: 8 }}
        >
          <Link to={{ pathname: '/collect/port' }}>{intlFmtMsg({ id: 'form.goback' })}</Link>
        </Button>
      </FormItem>
    </Form>
  );
}

export default Form.create()(CollectForm);
