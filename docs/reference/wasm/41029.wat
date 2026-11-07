  (func (;41029;) (type 1) (param i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 f32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4365130
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3356428
      call 2180
      i32.const 3383824
      call 2180
      i32.const 3383812
      call 2180
      i32.const 3349928
      call 2180
      i32.const 3359088
      call 2180
      i32.const 3359680
      call 2180
      i32.const 3388060
      call 2180
      i32.const 3388064
      call 2180
      i32.const 3390824
      call 2180
      i32.const 3385852
      call 2180
      i32.const 3387844
      call 2180
      i32.const 3387848
      call 2180
      i32.const 3385856
      call 2180
      i32.const 3390828
      call 2180
      i32.const 3482868
      call 2180
      i32.const 4365130
      i32.const 1
      i32.store8
    end
    i32.const 3388064
    i32.load
    local.set 1
    local.get 0
    i32.load offset=60
    local.tee 4
    local.get 4
    i32.load offset=16
    i32.const 1
    i32.add
    i32.store offset=16
    block  ;; label = @1
      local.get 1
      i32.load offset=16
      i32.load offset=96
      i32.load offset=100
      call 2224
      if  ;; label = @2
        local.get 4
        i32.load offset=12
        local.set 1
        local.get 4
        i32.const 0
        i32.store offset=12
        local.get 1
        i32.const 0
        i32.le_s
        br_if 1 (;@1;)
        local.get 4
        i32.load offset=8
        i32.const 0
        local.get 1
        i32.const 0
        call 54070
        br 1 (;@1;)
      end
      local.get 4
      i32.const 0
      i32.store offset=12
    end
    block  ;; label = @1
      local.get 0
      i32.load offset=36
      i32.load offset=32
      local.tee 4
      i32.eqz
      br_if 0 (;@1;)
      local.get 4
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=68
      local.tee 4
      i32.eqz
      br_if 0 (;@1;)
      local.get 4
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      i32.const 3349928
      i32.load
      call 1900
      local.tee 7
      i32.const 3383812
      i32.load
      call 35517
      local.get 0
      i32.load offset=36
      i32.load offset=32
      local.tee 1
      i32.load offset=12
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      i32.const 0
      local.set 4
      loop  ;; label = @2
        local.get 1
        local.get 4
        local.get 3
        i32.const 12
        i32.add
        i32.const 3385856
        i32.load
        call 50458
        block  ;; label = @3
          local.get 3
          i32.load offset=12
          local.tee 1
          i32.eqz
          br_if 0 (;@3;)
          local.get 1
          i32.load offset=12
          i32.const 2
          i32.lt_s
          br_if 0 (;@3;)
          local.get 1
          i32.const 0
          local.get 3
          i32.const 12
          i32.add
          i32.const 3387848
          i32.load
          call 50458
          local.get 3
          i32.load offset=12
          local.set 2
          local.get 1
          i32.const 1
          local.get 3
          i32.const 12
          i32.add
          i32.const 3387848
          i32.load
          call 50458
          local.get 2
          i32.const 0
          i32.le_s
          br_if 0 (;@3;)
          local.get 3
          i32.load offset=12
          local.set 8
          local.get 0
          i32.load offset=68
          i32.load offset=12
          local.get 2
          i32.mul
          f32.convert_i32_s
          local.set 10
          i32.const 4370285
          i32.load8_u
          i32.eqz
          if  ;; label = @4
            i32.const 3360048
            call 2180
            i32.const 4370285
            i32.const 1
            i32.store8
          end
          local.get 10
          f32.const 0x1.9p+6 (;=100;)
          f32.div
          local.set 10
          i32.const 3360048
          i32.load
          local.tee 1
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 1
            call 60460
          end
          i32.const 3383824
          i32.load
          local.set 5
          local.get 3
          local.get 0
          i32.load offset=68
          i32.load offset=12
          local.tee 6
          block (result i32)  ;; label = @4
            local.get 10
            f32.floor
            local.tee 10
            f32.abs
            f32.const 0x1p+31 (;=2.14748e+09;)
            f32.lt
            if  ;; label = @5
              local.get 10
              i32.trunc_f32_s
              br 1 (;@4;)
            end
            i32.const -2147483648
          end
          local.tee 1
          local.get 1
          local.get 6
          i32.gt_s
          select
          i32.const 1
          i32.sub
          i32.const 0
          local.get 1
          i32.const 0
          i32.gt_s
          select
          local.tee 1
          i32.store offset=12
          local.get 7
          local.get 3
          i32.const 12
          i32.add
          local.get 5
          call 35541
          i32.eqz
          if  ;; label = @4
            local.get 3
            local.get 1
            i32.store offset=12
            i32.const 3359088
            i32.load
            local.get 3
            i32.const 12
            i32.add
            call 2193
            local.set 1
            local.get 3
            local.get 2
            i32.store offset=8
            i32.const 3359088
            i32.load
            local.get 3
            i32.const 8
            i32.add
            call 2193
            local.set 2
            i32.const 3482868
            i32.load
            local.get 1
            local.get 2
            i32.const 0
            call 48227
            local.set 1
            i32.const 3356428
            i32.load
            local.tee 2
            i32.load offset=116
            i32.eqz
            if  ;; label = @5
              local.get 2
              call 60460
            end
            local.get 1
            i32.const 0
            call 55817
            br 1 (;@3;)
          end
          local.get 0
          i32.load offset=68
          local.get 1
          local.get 3
          i32.const 12
          i32.add
          i32.const 3390828
          i32.load
          call 50458
          local.get 3
          i32.load offset=12
          local.tee 5
          i32.eqz
          br_if 0 (;@3;)
          local.get 5
          i32.load offset=12
          local.tee 2
          i32.eqz
          br_if 0 (;@3;)
          local.get 5
          i32.const 1
          i32.store8 offset=16
          i32.const 0
          local.set 6
          block  ;; label = @4
            local.get 2
            i32.load offset=32
            local.tee 2
            i32.eqz
            br_if 0 (;@4;)
            local.get 2
            i32.load offset=12
            local.tee 9
            i32.const 0
            i32.le_s
            br_if 0 (;@4;)
            local.get 2
            local.get 9
            i32.const 1
            i32.sub
            local.get 3
            i32.const 12
            i32.add
            i32.const 3385856
            i32.load
            call 50458
            local.get 3
            i32.load offset=12
            local.tee 2
            i32.eqz
            br_if 0 (;@4;)
            local.get 2
            i32.load offset=12
            i32.const 0
            i32.le_s
            br_if 0 (;@4;)
            local.get 2
            i32.const 0
            local.get 3
            i32.const 12
            i32.add
            i32.const 3387848
            i32.load
            call 50458
            local.get 3
            i32.load offset=12
            local.set 6
          end
          i32.const 3359680
          i32.load
          call 1900
          local.set 2
          local.get 5
          i32.load offset=12
          i32.load offset=8
          local.set 5
          local.get 2
          local.get 6
          i32.store offset=20
          local.get 2
          local.get 1
          i32.store offset=12
          local.get 2
          local.get 5
          i32.store offset=8
          local.get 2
          i32.const 0
          i32.store16 offset=32
          local.get 2
          i64.const 1
          i64.store offset=24 align=4
          local.get 2
          local.get 8
          i32.store offset=16
          local.get 0
          i32.load offset=60
          local.get 2
          i32.const 3388060
          i32.load
          call 50463
        end
        local.get 4
        i32.const 1
        i32.add
        local.tee 4
        local.get 0
        i32.load offset=36
        i32.load offset=32
        local.tee 1
        i32.load offset=12
        i32.lt_s
        br_if 0 (;@2;)
      end
    end
    local.get 3
    i32.const 16
    i32.add
    global.set 0)
