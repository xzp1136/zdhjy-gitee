  (func (;44407;) (type 3) (param i32 i32 i32) (result i32)
    (local i32 i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4367415
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3375560
      call 2180
      i32.const 3387112
      call 2180
      i32.const 4367415
      i32.const 1
      i32.store8
    end
    local.get 2
    i32.const 0
    i32.store offset=4
    i32.const 1
    local.set 3
    block  ;; label = @1
      local.get 1
      i32.const 3
      i32.eq
      br_if 0 (;@1;)
      i32.const 0
      local.set 3
      i32.const 3375560
      i32.load
      local.set 4
      local.get 0
      i32.load offset=48
      local.set 5
      local.get 2
      local.get 1
      i32.store offset=12
      local.get 5
      local.get 2
      i32.const 12
      i32.add
      local.get 2
      i32.const 4
      i32.add
      local.get 4
      call 34286
      i32.eqz
      br_if 0 (;@1;)
      i32.const 4367414
      i32.load8_u
      i32.eqz
      if  ;; label = @2
        i32.const 3375592
        call 2180
        i32.const 4367414
        i32.const 1
        i32.store8
      end
      local.get 2
      i32.const 0
      i32.store offset=8
      i32.const 3375592
      i32.load
      local.set 4
      local.get 0
      i32.load offset=204
      local.set 0
      local.get 2
      local.get 1
      i32.store offset=12
      local.get 0
      local.get 2
      i32.const 12
      i32.add
      local.get 2
      i32.const 8
      i32.add
      local.get 4
      call 34286
      local.set 1
      local.get 2
      i32.load offset=8
      i32.const 0
      local.get 1
      select
      local.tee 1
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      local.get 2
      i32.load offset=4
      i32.load offset=12
      local.get 1
      i32.lt_s
      local.set 3
    end
    local.get 2
    i32.const 16
    i32.add
    global.set 0
    local.get 3)
