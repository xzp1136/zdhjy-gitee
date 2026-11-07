  (func (;41038;) (type 15) (param i32 i32 i32 i32 i32 i32 i32)
    (local i32 i32 i32 i32 i32 f32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 8
    global.set 0
    i32.const 4365132
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3375576
      call 2180
      i32.const 3387152
      call 2180
      i32.const 3387156
      call 2180
      i32.const 4365132
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 5
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      i32.const 0
      local.set 0
      loop  ;; label = @2
        i32.const 3375576
        i32.load
        local.set 6
        local.get 8
        local.get 5
        local.get 7
        i32.const 2
        i32.shl
        i32.add
        i32.load offset=16
        i32.store offset=12
        local.get 4
        local.get 8
        i32.const 12
        i32.add
        local.get 8
        i32.const 8
        i32.add
        local.get 6
        call 34434
        local.get 8
        i32.load offset=8
        i32.load offset=12
        local.get 0
        i32.add
        local.set 0
        local.get 7
        i32.const 1
        i32.add
        local.tee 7
        local.get 5
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
      local.get 0
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      local.get 0
      local.get 2
      i32.mul
      f32.convert_i32_s
      local.set 12
      i32.const 4370285
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3360048
        call 2180
        i32.const 4370285
        i32.const 1
        i32.store8
      end
      local.get 12
      f32.const 0x1.9p+6 (;=100;)
      f32.div
      local.set 12
      i32.const 3360048
      i32.load
      local.tee 7
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 7
        call 60460
      end
      block (result i32)  ;; label = @2
        local.get 12
        f32.floor
        local.tee 12
        f32.abs
        f32.const 0x1p+31 (;=2.14748e+09;)
        f32.lt
        if  ;; label = @3
          local.get 12
          i32.trunc_f32_s
          br 1 (;@2;)
        end
        i32.const -2147483648
      end
      local.set 7
      local.get 5
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      i32.const 0
      local.get 0
      i32.const 1
      i32.sub
      local.tee 0
      local.get 7
      local.get 0
      local.get 7
      i32.lt_s
      select
      local.get 7
      i32.const 0
      i32.lt_s
      select
      local.set 2
      i32.const 0
      local.set 0
      i32.const 0
      local.set 7
      loop  ;; label = @2
        i32.const 3375576
        i32.load
        local.set 6
        local.get 8
        local.get 5
        local.get 7
        i32.const 2
        i32.shl
        i32.add
        i32.load offset=16
        local.tee 10
        i32.store offset=12
        local.get 4
        local.get 8
        i32.const 12
        i32.add
        local.get 8
        i32.const 8
        i32.add
        local.get 6
        call 34434
        local.get 8
        i32.load offset=8
        local.tee 11
        i32.load offset=12
        local.tee 9
        local.get 0
        i32.add
        local.tee 6
        local.get 2
        i32.gt_s
        if  ;; label = @3
          local.get 8
          local.get 1
          local.get 3
          local.get 10
          local.get 8
          call 41039
          local.tee 5
          i32.eqz
          br_if 2 (;@1;)
          local.get 11
          i32.const 0
          local.get 9
          local.get 2
          local.get 0
          i32.sub
          local.tee 7
          local.get 7
          local.get 9
          i32.gt_s
          select
          local.get 7
          i32.const 0
          i32.lt_s
          select
          local.get 5
          i32.const 3387152
          i32.load
          call 50447
          br 2 (;@1;)
        end
        local.get 6
        local.set 0
        local.get 7
        i32.const 1
        i32.add
        local.tee 7
        local.get 5
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 8
    i32.const 16
    i32.add
    global.set 0)
